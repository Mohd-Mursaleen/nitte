import dynamic from "next/dynamic";

// No SSR — SmallWebRTCTransport uses RTCPeerConnection and other browser-only APIs
const VoiceCall = dynamic(() => import("./VoiceCall"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#0a0a0a]" />,
});

export default function CallPage() {
  return <VoiceCall />;
}
