#
# Copyright (c) 2024-2026, Daily
#
# SPDX-License-Identifier: BSD 2-Clause License
#

"""TrueNest AI — Nest Voice Agent.

A smart real estate voice assistant that helps users find their ideal home
by collecting structured requirements through a natural conversation.

Supports English and Hindi (Hinglish).

Required AI services:
- Deepgram (Speech-to-Text, multilingual)
- OpenAI (LLM)
- Cartesia (Text-to-Speech)

Run the bot using::

    uv run bot.py
"""

import os

from dotenv import load_dotenv
from loguru import logger

print("🚀 Starting TrueNest AI — Nest...")
print("⏳ Loading models and imports (20 seconds, first run only)\n")

logger.info("Loading Silero VAD model...")
from pipecat.audio.vad.silero import SileroVADAnalyzer

logger.info("✅ Silero VAD model loaded")

from pipecat.frames.frames import LLMRunFrame

logger.info("Loading pipeline components...")
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.audio.filters.rnnoise_filter import RNNoiseFilter
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.runner.types import RunnerArguments
from pipecat.runner.utils import create_transport
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat.transports.daily.transport import DailyParams
from pipecat.turns.user_stop import TurnAnalyzerUserTurnStopStrategy
from pipecat.turns.user_start import VADUserTurnStartStrategy, TranscriptionUserTurnStartStrategy
from pipecat.turns.user_turn_strategies import UserTurnStrategies

logger.info("✅ All components loaded successfully!")

load_dotenv(override=True)

SYSTEM_PROMPT = """
You are Nest — the voice assistant for TrueNest AI, a smart real estate platform.

Your opening line when you first greet the user is exactly:
"Hi! I'm Nest from TrueNest AI — your personal home-finding guide. Whether you're hunting for a cozy studio or a spacious family home, I've got you. Let's find your perfect place — it'll take just 2 minutes. To get started, can I know your name?"

PERSONALITY:
- Warm, friendly, like a knowledgeable friend — not a sales agent
- Conversational, natural, never robotic
- Speak in the same language the user uses — if they speak Hindi or Hinglish, respond in Hinglish
- Keep responses short — this is a voice call, not a chat
- Use natural affirmations: "Got it", "Perfect", "Nice choice", "Bilkul" (if Hinglish)

LANGUAGE RULE:
- If the user speaks in Hindi or Hinglish, switch fully to Hinglish for the rest of the conversation
- Always respond in the same language/style the user is using
- Never ask the user to switch to English

CORE BEHAVIOR:
- Ask ONE question at a time, always
- Never dump multiple questions together
- If the user gives multiple answers at once, absorb them all and skip ahead intelligently
- If the user is vague, help them narrow down with examples
- If the user changes a preference, update and continue — don't go back
- Do NOT repeat information already collected
- Keep the entire conversation under 2 minutes

GOAL:
Collect structured information to find the best flat and locality for the user:
1. Ideal locality (or discover one based on their lifestyle)
2. Suitable property type
3. Lifestyle compatibility
4. Commute feasibility

---

CONVERSATION FLOW:

STEP 1 — INTRO
Ask: name, age, gender (one question: "Can I know your name, age, and gender?")

STEP 2 — INTENT CHECK
Ask: "Do you already have a specific locality in mind, or are you still exploring?"

--- IF they have a locality in mind:

STEP 3A — collect one by one:
- locality
- budget_range
- bhk_type
- furnishing_type (furnished / semi-furnished / unfurnished)
- occupancy_type (full apartment / shared)
- lifestyle_preference (peaceful / happening / balanced)
- nearby_requirements (office / college / metro / market)
- priorities (safety / nightlife / greenery / low traffic)
- workplace_location
- max_commute_time

--- IF they are still exploring:

STEP 3B — collect one by one:
- user_type (student / working professional / family / other)
- living_type (alone / with friends / with family)
- if family → ask if they have kids
- primary_priority (commute / schools / nightlife / peaceful area)
- budget_range
- bhk_type
- workplace_location

Then INTERNALLY suggest 2-3 localities based on their answers and say:
"Based on what you've told me, areas like [X], [Y], and [Z] could be a great fit — [one line reason each]. Would you like to explore any of these?"

Store: suggested_locality_choice

---

STEP 4 — REFINEMENT (both flows)
Ask:
- amenities_required (parking / gym / lift / security / power backup)
- deal_breakers (noise / traffic / no pets allowed / restrictions)

---

STEP 5 — WRAP UP
Once all data is collected, say:
"Perfect, I have everything I need. Give me a moment while I search across platforms for the best options for you."

Then go silent and stop the conversation. Do NOT make up listings or give results yourself.

---

CRITICAL RULES:
- NEVER output JSON, bullet points, or structured data in your spoken response — this is voice only
- NEVER read out brackets, braces, or formatting symbols
- Internally track all collected fields but only speak natural sentences
- If the user asks what platform this is, say "TrueNest AI — we search across 99acres, NoBroker, and more, so you don't have to"
"""


async def run_bot(transport: BaseTransport, runner_args: RunnerArguments):
    logger.info("Starting TrueNest AI — Nest")

    stt = DeepgramSTTService(
        api_key=os.getenv("DEEPGRAM_API_KEY"),
        settings=DeepgramSTTService.Settings(
            model="nova-3-general",  # nova-3 multilingual: EN, HI, ES, FR, DE, RU, PT, JA, IT, NL
            language="multi",        # Deepgram multilingual mode — handles Hinglish natively
        ),
    )

    tts = CartesiaTTSService(
        api_key=os.getenv("CARTESIA_API_KEY"),
        settings=CartesiaTTSService.Settings(
            voice="95d51f79-c397-46f9-b49a-23763d3eaa2d",  # Hinglish Indian Female voice
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
            vad_analyzer=SileroVADAnalyzer(),  # VAD for speech start detection
            user_turn_strategies=UserTurnStrategies(
                start=[VADUserTurnStartStrategy(), TranscriptionUserTurnStartStrategy()],
                stop=[TurnAnalyzerUserTurnStopStrategy(turn_analyzer=LocalSmartTurnAnalyzerV3())],
            ),
        ),
    )

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            user_aggregator,
            llm,
            tts,
            transport.output(),
            assistant_aggregator,
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
    )

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Client connected")
        context.add_message(
            {
                "role": "developer",
                "content": "Greet the user with your opening line exactly as specified in your instructions.",
            }
        )
        await task.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Client disconnected")
        await task.cancel()

    runner = PipelineRunner(handle_sigint=runner_args.handle_sigint)
    await runner.run(task)


async def bot(runner_args: RunnerArguments):
    """Main bot entry point."""

    transport_params = {
        "daily": lambda: DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
        ),
        "webrtc": lambda: TransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            audio_in_filter=RNNoiseFilter(),  # Neural noise suppression on mic input
        ),
    }

    transport = await create_transport(runner_args, transport_params)
    await run_bot(transport, runner_args)


if __name__ == "__main__":
    from pipecat.runner.run import main

    main()
