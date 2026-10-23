import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Terminal, 
  ArrowRight, 
  Bot, 
  Volume2, 
  VolumeX, 
  Info, 
  HelpCircle 
} from "lucide-react";

interface VoiceAssistantControllerProps {
  authToken: string;
  onNavigate: (tab: string) => void;
  onSelectMachineById: (id: string) => void;
  onAddNotification: (message: string, type: 'alert' | 'success' | 'info') => void;
}

export default function VoiceAssistantController({
  authToken,
  onNavigate,
  onSelectMachineById,
  onAddNotification
}: VoiceAssistantControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [commandText, setCommandText] = useState("");
  const [assistantOutput, setAssistantOutput] = useState("Awaiting operator instructions. Say or type a command.");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setAssistantOutput("Listening for voice transmission...");
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setAssistantOutput("Microphone access denied. Please open in a new tab or use typing console.");
        } else {
          setAssistantOutput("Signal interrupted. Please speak clearly or type below.");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommandText(transcript);
        handleExecuteCommand(transcript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        setAssistantOutput("Web Speech API not supported in this environment. Use typing console.");
        return;
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech:", err);
      }
    }
  };

  // Speaks response text back using window SpeechSynthesis
  const speakResponse = (text: string) => {
    if (!audioEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95; // Technical robot pitch
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech Synthesis blocked or unsupported:", err);
    }
  };

  // Submit spoken or typed text command to backend interpreter
  const handleExecuteCommand = async (command: string) => {
    if (!command.trim()) return;
    setAssistantOutput("Interpreting system telemetry vector...");

    try {
      const response = await fetch("/api/voice-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ command })
      });

      if (response.ok) {
        const result = await response.json();
        setAssistantOutput(result.speechResponse);
        speakResponse(result.speechResponse);

        // Perform visual macro actions returned by the Gemini controller
        if (result.action === "navigate") {
          onNavigate(result.target);
          onAddNotification(`Voice navigation macro triggered: ${result.target.replace('_', ' ')}`, "info");
        } else if (result.action === "focus_machine") {
          onSelectMachineById(result.target);
          onAddNotification(`Voice Diagnostic Link engaged with machine: ${result.target}`, "success");
        }
      } else {
        setAssistantOutput("Error interfacing with SCADA translation matrix.");
      }
    } catch (err) {
      console.error("Voice command execution error:", err);
      setAssistantOutput("Server connection timed out.");
    }

    setCommandText("");
  };

  return (
    <div id="badge-voice-assistant" className="glass-panel p-4.5 rounded-xl border border-sky-500/30 bg-gradient-to-br from-scada-light/60 to-scada-dark/95 space-y-4 shadow-xl select-none relative">
      
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-scada-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-sky-400 animate-pulse" />
          <span className="text-xs font-display font-semibold text-slate-200 uppercase tracking-wide">
            SCADA AI Terminal Console
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            id="btn-voice-audio-toggle"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1 rounded hover:bg-scada-light text-slate-400 hover:text-white transition-colors"
            title={audioEnabled ? "Disable Speech Output" : "Enable Speech Output"}
          >
            {audioEnabled ? <Volume2 className="h-3.5 w-3.5 text-sky-400" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Guidelines info */}
          <button
            id="btn-voice-help-toggle"
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 rounded hover:bg-scada-light text-slate-400 hover:text-white transition-colors"
            title="Help Commands"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Guide lines dropdown */}
      {showHelp && (
        <div className="p-3 bg-scada-dark rounded-lg border border-scada-border/40 text-[10px] text-slate-300 space-y-2 leading-relaxed animate-in fade-in duration-200">
          <p className="font-bold text-sky-400 uppercase tracking-wider">Example commands available:</p>
          <ul className="space-y-1 font-mono">
            <li>• "Show digital twin floor plan"</li>
            <li>• "Navigate to charts analytics page"</li>
            <li>• "Show conveyor alpha status"</li>
            <li>• "Focus diagnostic panel on CNC machine"</li>
          </ul>
        </div>
      )}

      {/* Assistant bubble response feedback */}
      <div className="p-3 bg-scada-dark rounded-lg border border-scada-border/20 flex gap-2.5 items-start">
        <Bot className="h-5 w-5 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-[11px] text-slate-200 leading-relaxed font-sans font-medium">
          {assistantOutput}
        </div>
      </div>

      {/* Dual control row: Microphone and text command bar */}
      <div className="flex items-center gap-2">
        {/* Recording mic button */}
        <button
          id="btn-voice-mic-trigger"
          onClick={toggleVoiceListening}
          className={`p-3.5 rounded-lg border text-white transition-all duration-300 ${
            isListening 
              ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse led-glow-red" 
              : "bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20 text-sky-400 hover:border-sky-400"
          }`}
          title={isListening ? "Stop Voice Recognition" : "Initiate Speech Microphone"}
        >
          {isListening ? <Mic className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
        </button>

        {/* Console Input field */}
        <div className="flex-1 relative">
          <input
            id="input-voice-terminal-command"
            type="text"
            placeholder="Type console commands (e.g. 'show charts')..."
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecuteCommand(commandText);
            }}
            className="w-full bg-scada-dark text-xs text-white placeholder-slate-500 rounded-lg border border-scada-border px-3.5 py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all font-mono"
          />
          <button
            id="btn-submit-voice-command"
            onClick={() => handleExecuteCommand(commandText)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-scada-light text-slate-400 hover:text-sky-400 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="text-[9px] text-slate-500 text-center font-mono">
        * Web Speech and Web SpeechSynthesis API couplings active.
      </div>
    </div>
  );
}
