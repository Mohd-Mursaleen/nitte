#
# Copyright (c) 2024-2026, Daily
#
# SPDX-License-Identifier: BSD 2-Clause License
#

"""TrueNest AI — Sara Outbound Twilio Call.

Makes an outbound phone call using Twilio and runs the Sara voice pipeline.

Setup:
    1. Run ngrok:          ngrok http 8765
    2. Set PUBLIC_URL in .env to your ngrok HTTPS URL
    3. Update TWILIO_AUTH_TOKEN in .env (rotate it — it was shared in chat)
    4. Install deps:       uv sync
    5. Run:                uv run outbound.py

The bot dials TWILIO_TO_NUMBER automatically on startup.
"""

import asyncio
import json
import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import PlainTextResponse
from loguru import logger
from twilio.rest import Client as TwilioClient

from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.serializers.twilio import TwilioFrameSerializer
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.transports.websocket.fastapi import (
    FastAPIWebsocketParams,
    FastAPIWebsocketTransport,
)
from pipecat.turns.user_start import TranscriptionUserTurnStartStrategy, VADUserTurnStartStrategy
from pipecat.turns.user_stop import TurnAnalyzerUserTurnStopStrategy
from pipecat.turns.user_turn_strategies import UserTurnStrategies

load_dotenv(override=True)

ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "+12297432113")
TO_NUMBER = os.getenv("TWILIO_TO_NUMBER", "+918218134534")
PUBLIC_URL = os.getenv("PUBLIC_URL", "").rstrip("/")

SYSTEM_PROMPT = """
Aap Sara hain — TrueNest AI ki voice assistant. Aap ek real estate platform ke liye ghar dhundhne mein help karti hain.

GREETING (exactly):
"Namaste! Main Sara hoon, TrueNest AI se. Aapka perfect ghar dhundhne mein help karungi — sirf 2 minute lagenge. Aapka naam kya hai?"

---

LANGUAGE — STRICT RULES:
- ALWAYS speak in Hindi. Default language is Hindi.
- If user replies in English, respond in Hinglish (Hindi + English mix).
- NEVER switch fully to English. Hindi is always preferred.
- Use simple, everyday Hindi — not formal or literary.

---

RESPONSE LENGTH — STRICT RULES:
- Maximum 1-2 short sentences per response. Always.
- Never explain, never elaborate, never summarize.
- One acknowledgment word + one question. That's it.
- BAD: "Bahut acha! Maine aapka budget note kar liya hai. Ab main aapko batana chahungi ki..."
- GOOD: "Bilkul! Kitne BHK chahiye?"
- BAD: "Great choice! Koramangala ek bahut hi acchi jagah hai, wahan metro bhi hai aur..."
- GOOD: "Theek hai. Budget kya hai?"

---

EXAMPLE CONVERSATION (follow this style exactly):
Sara: "Namaste! Main Sara hoon, TrueNest AI se. Aapka perfect ghar dhundhne mein help karungi — sirf 2 minute lagenge. Aapka naam kya hai?"
User: "Rahul"
Sara: "Hi Rahul! Kaunsa area pasand hai — ya abhi explore kar rahe hain?"
User: "Koramangala chahiye"
Sara: "Bilkul. Budget kya hai?"
User: "30 se 40 haazar"
Sara: "Okay. Kitne BHK?"
User: "2BHK"
Sara: "Furnished chahiye ya unfurnished?"
User: "Semi-furnished"
Sara: "Koi zaruri cheez — parking, metro nearby, kuch aur?"
User: "Metro paas hona chahiye"
Sara: "Perfect. Bas ek minute — main best options dhundh rahi hoon."

---

6 QUESTIONS — ASK EXACTLY THESE, ONE BY ONE:
1. Kaunsa area / locality? (ya explore kar rahe hain?)
2. Budget kya hai? (monthly rent)
3. Kitne BHK chahiye?
4. Furnished, semi-furnished, ya unfurnished?
5. Koi specific zarurat — metro, office paas, parking?
6. Koi deal-breaker — koi cheez jo bilkul nahi chahiye?

If user gives multiple answers at once, absorb and skip those questions.

---

WRAP UP:
After all 6 questions (or when enough info is collected), say exactly:
"Perfect. Bas ek minute — main best options dhundh rahi hoon."

Then stop. Do NOT add anything after this.

---

ABSOLUTE RULES:
- Never output JSON, bullets, or formatting — voice only
- Never read brackets or symbols
- Never ask more than 6 questions total
- Never give long responses — ever
- Never suggest specific listings or prices yourself
"""

app = FastAPI()


@app.api_route("/twiml", methods=["GET", "POST"])
async def twiml_endpoint(request: Request):
    """Return TwiML that connects the call to our WebSocket media stream."""
    ws_url = PUBLIC_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws"
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="{ws_url}"/>
    </Connect>
</Response>"""
    return PlainTextResponse(twiml, media_type="application/xml")


async def _run_sara_pipeline(transport: FastAPIWebsocketTransport):
    """Build and run the Sara voice pipeline on the given transport.

    Args:
        transport: FastAPI WebSocket transport connected to Twilio Media Stream.
    """
    stt = DeepgramSTTService(
        api_key=os.getenv("DEEPGRAM_API_KEY"),
        settings=DeepgramSTTService.Settings(
            model="nova-3-general",
            language="multi",
        ),
    )

    tts = CartesiaTTSService(
        api_key=os.getenv("CARTESIA_API_KEY"),
        settings=CartesiaTTSService.Settings(
            voice="95d51f79-c397-46f9-b49a-23763d3eaa2d",
            language="hi-IN",
        ),
    )

    llm = OpenAILLMService(
        api_key=os.getenv("OPENAI_API_KEY"),
        settings=OpenAILLMService.Settings(
            model="gpt-4.1-2025-04-14",
            system_instruction=SYSTEM_PROMPT,
        ),
    )

    context = LLMContext()
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(
            vad_analyzer=SileroVADAnalyzer(),
            user_turn_strategies=UserTurnStrategies(
                start=[VADUserTurnStartStrategy(), TranscriptionUserTurnStartStrategy()],
                stop=[TurnAnalyzerUserTurnStopStrategy(turn_analyzer=LocalSmartTurnAnalyzerV3())],
            ),
        ),
    )

    pipeline = Pipeline([
        transport.input(),
        stt,
        user_aggregator,
        llm,
        tts,
        transport.output(),
        assistant_aggregator,
    ])

    task = PipelineTask(
        pipeline,
        params=PipelineParams(enable_metrics=True, enable_usage_metrics=True),
    )

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, websocket):
        logger.info("Twilio stream active — Sara starting")
        context.add_message({
            "role": "developer",
            "content": "Greet the user with your exact opening line from the instructions. Speak in Hindi.",
        })
        await task.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, websocket):
        logger.info("Twilio stream ended")
        await task.cancel()

    runner = PipelineRunner(handle_sigint=False)
    await runner.run(task)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handle Twilio Media Stream WebSocket.

    Waits for the Twilio "start" event to obtain stream_sid and call_sid,
    then hands off to the Sara pipeline.
    """
    await websocket.accept()
    logger.info("Twilio WebSocket connected — waiting for stream start")

    # Parse initial Twilio handshake events to extract SIDs
    stream_sid = None
    call_sid = None

    while True:
        try:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            event = data.get("event")

            if event == "connected":
                logger.debug("Twilio connected event received")
                continue
            elif event == "start":
                stream_sid = data.get("streamSid")
                call_sid = data["start"].get("callSid")
                logger.info(f"Stream started — stream_sid={stream_sid}, call_sid={call_sid}")
                break
            else:
                logger.debug(f"Ignoring Twilio event during handshake: {event}")
        except Exception as e:
            logger.error(f"Twilio handshake failed: {e}")
            return

    serializer = TwilioFrameSerializer(
        stream_sid=stream_sid,
        call_sid=call_sid,
        account_sid=ACCOUNT_SID,
        auth_token=AUTH_TOKEN,
    )

    transport = FastAPIWebsocketTransport(
        websocket,
        FastAPIWebsocketParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            add_wav_header=False,
            serializer=serializer,
        ),
    )

    await _run_sara_pipeline(transport)


def _make_outbound_call():
    """Initiate the outbound Twilio call to TWILIO_TO_NUMBER.

    Raises:
        ValueError: If PUBLIC_URL is not configured in .env.
        Exception: If Twilio REST call fails.
    """
    if not PUBLIC_URL or "ngrok" not in PUBLIC_URL and "your-ngrok" in PUBLIC_URL:
        raise ValueError(
            "PUBLIC_URL not configured. Run ngrok http 8765 and set PUBLIC_URL in .env"
        )

    client = TwilioClient(ACCOUNT_SID, AUTH_TOKEN)
    call = client.calls.create(
        to=TO_NUMBER,
        from_=FROM_NUMBER,
        url=f"{PUBLIC_URL}/twiml",
    )
    logger.info(f"Outbound call placed — SID: {call.sid} | {FROM_NUMBER} -> {TO_NUMBER}")
    return call.sid


@app.post("/call")
async def call_endpoint(request: Request):
    """Trigger an outbound call to TWILIO_TO_NUMBER.

    Returns:
        JSON with call SID on success, error message on failure.
    """
    from fastapi.responses import JSONResponse

    try:
        sid = _make_outbound_call()
        return JSONResponse({"status": "calling", "call_sid": sid, "to": TO_NUMBER})
    except Exception as e:
        logger.error(f"Call failed: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


if __name__ == "__main__":
    logger.info("Starting TrueNest AI — Sara (Twilio Outbound)")
    logger.info(f"Trigger call: POST http://localhost:8765/call")
    uvicorn.run(app, host="0.0.0.0", port=8765)
