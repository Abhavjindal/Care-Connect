import React, { useState, useEffect, useRef, useContext } from 'react';
import { API_BASE_URL } from '../config/api';
import { AuthContext } from '../App';

const ChatWidget = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am your CareConnect AI Doctor. How can I help you with your health or wellness today?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const emergencyKeywords = [
    "emergency", "chest pain", "heart attack", "cardiac arrest", "difficulty breathing",
    "shortness of breath", "choking", "stroke", "paralysis", "severe bleeding",
    "unconscious", "passed out", "fainted", "seizure", "poison", "overdose",
    "suicidal", "kill myself", "accident", "crash", "911", "108", "102", "ambulance",
    "emergency room", "immediate medical attention", "call an ambulance"
  ];

  const checkEmergency = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return emergencyKeywords.some(keyword => lower.includes(keyword));
  };

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Ambulance Siren Web Audio Synth Effect
  useEffect(() => {
    let audioCtx = null;
    let sirenInterval = null;
    let oscillator = null;
    let gainNode = null;

    if (isEmergency) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          
          oscillator = audioCtx.createOscillator();
          gainNode = audioCtx.createGain();
          
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(650, audioCtx.currentTime);
          
          let high = true;
          sirenInterval = setInterval(() => {
            if (audioCtx && oscillator) {
              const nextFreq = high ? 900 : 650;
              oscillator.frequency.exponentialRampToValueAtTime(nextFreq, audioCtx.currentTime + 0.35);
              high = !high;
            }
          }, 500);
          
          const filter = audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
          
          gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime); // volume limit to 12% to be noticeable but pleasant
          
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.start();
        }
      } catch (err) {
        console.error("Failed to initialize emergency siren synth:", err);
      }
    }

    return () => {
      if (sirenInterval) clearInterval(sirenInterval);
      if (oscillator) {
        try { oscillator.stop(); } catch(e) {}
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch(e) {}
      }
    };
  }, [isEmergency]);

  // Speak AI Doctor's reply using browser Text-to-Speech
  const speakReply = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Cancel any active speaking
    window.speechSynthesis.cancel();
    
    // Create new utterance
    const cleanText = text.replace(/[🩺❌⚠️✅🤖💬💭🎧🎙️🔊📋🧠🔍*]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to pick a premium friendly female system voice if available
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Microsoft Zira') || 
      v.name.includes('Natural') || 
      v.lang.startsWith('en')
    );
    if (friendlyVoice) utterance.voice = friendlyVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Listening
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not fully supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Send message
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { text: userText, isBot: false }]);
    setInputValue('');
    setIsTyping(true);

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Check user query for emergency keywords
    if (checkEmergency(userText)) {
      setTimeout(() => {
        setIsEmergency(true);
      }, 500);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/doctors/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userText })
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const botReply = data.reply;

      setMessages((prev) => [...prev, { text: botReply, isBot: true }]);
      setIsTyping(false);
      
      // Speak the reply out loud
      speakReply(botReply);

      // Check bot reply for emergency keywords
      if (checkEmergency(botReply)) {
        setTimeout(() => {
          setIsEmergency(true);
        }, 800);
      }
    } catch (err) {
      console.error("AI Doctor chat failed:", err);
      setMessages((prev) => [...prev, { text: "⚠️ I'm sorry, I am experiencing temporary difficulties reaching the CareConnect servers. Please try again in a moment.", isBot: true }]);
      setIsTyping(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsEmergency(false);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleVoiceToggle = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    if (!nextState && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <>
      {/* Dynamic CSS Styling Injector */}
      <style>{`
        .cc-widget-btn {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1977cc, #3f7fdb);
          color: white;
          border: none;
          box-shadow: 0 4px 15px rgba(25, 119, 204, 0.4);
          cursor: pointer;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: cc-float 3s ease-in-out infinite;
        }
        .cc-widget-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(25, 119, 204, 0.6);
        }
        .cc-widget-btn i {
          font-size: 26px;
        }
        .cc-chat-panel {
          position: fixed;
          bottom: 100px;
          right: 25px;
          width: 380px;
          height: 520px;
          border-radius: 16px;
          background: white;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          z-index: 9998;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: translateY(20px);
          opacity: 0;
          pointer-events: none;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .cc-chat-panel.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .cc-chat-header {
          background: linear-gradient(135deg, #1977cc, #2487e0);
          color: white;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }
        .cc-chat-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 16px;
        }
        .cc-chat-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cc-voice-toggle {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }
        .cc-voice-toggle.active {
          background: rgba(255, 255, 255, 0.35);
          font-weight: bold;
        }
        .cc-chat-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .cc-chat-close:hover {
          opacity: 1;
        }
        .cc-chat-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cc-message-row {
          display: flex;
          width: 100%;
        }
        .cc-message-row.user {
          justify-content: flex-end;
        }
        .cc-message-row.bot {
          justify-content: flex-start;
        }
        .cc-message-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.45;
          word-wrap: break-word;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .cc-message-row.user .cc-message-bubble {
          background-color: #1977cc;
          color: white;
          border-bottom-right-radius: 2px;
        }
        .cc-message-row.bot .cc-message-bubble {
          background-color: white;
          color: #333333;
          border-bottom-left-radius: 2px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .cc-typing-row {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 5px;
          padding: 5px 15px;
        }
        .cc-typing-bubble {
          background-color: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 8px 14px;
          border-radius: 18px;
          border-bottom-left-radius: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .cc-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #1977cc;
          animation: cc-bounce 1.4s infinite ease-in-out both;
        }
        .cc-dot:nth-child(1) { animation-delay: -0.32s; }
        .cc-dot:nth-child(2) { animation-delay: -0.16s; }
        
        .cc-chat-input-container {
          padding: 12px;
          background-color: white;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cc-chat-input {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 8px 16px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .cc-chat-input:focus {
          border-color: #1977cc;
        }
        .cc-mic-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: #f1f5f9;
          color: #475569;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .cc-mic-btn:hover {
          background-color: #e2e8f0;
          color: #0f172a;
        }
        .cc-mic-btn.active {
          background-color: #ef4444;
          color: white;
          animation: cc-pulse-red 1.5s infinite;
        }
        .cc-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: #1977cc;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .cc-send-btn:hover {
          background-color: #1665a9;
          transform: scale(1.05);
        }
        .cc-send-btn:disabled {
          background-color: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        /* Emergency Screen Styling - Fullscreen Modal */
        .cc-emergency-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: cc-fade-in-backdrop 0.25s ease-out;
        }
        .cc-emergency-modal {
          background: linear-gradient(135deg, #7a0812 0%, #3a0307 100%);
          color: white;
          padding: 2.5rem;
          border-radius: 20px;
          width: 90%;
          max-width: 520px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 45px rgba(255, 59, 48, 0.35);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid rgba(255, 59, 48, 0.35);
          animation: cc-slide-up-modal 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cc-emergency-icon {
          font-size: 4rem;
          color: #ff4d4d;
          animation: cc-pulse-warning 1.2s infinite;
          margin-bottom: 1.2rem;
        }
        .cc-emergency-title {
          font-weight: 800;
          font-size: 24px;
          margin-bottom: 0.8rem;
          letter-spacing: 0.5px;
          color: #ff4d4d;
          text-transform: uppercase;
        }
        .cc-emergency-desc {
          font-size: 15.5px;
          line-height: 1.6;
          color: #f1f5f9;
          margin-bottom: 2rem;
          opacity: 0.95;
        }
        .cc-emergency-actions {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          margin-bottom: 2rem;
        }
        .cc-emergency-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          text-decoration: none !important;
          transition: all 0.2s ease-in-out;
          border: none;
          cursor: pointer;
        }
        .cc-btn-ambulance {
          background: #ff3b30;
          color: white !important;
          box-shadow: 0 4px 15px rgba(255, 59, 48, 0.4);
        }
        .cc-btn-ambulance:hover {
          background: #e02d22;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 59, 48, 0.6);
        }
        .cc-btn-contact {
          background: white;
          color: #7a0812 !important;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
        }
        .cc-btn-contact:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
        }
        .cc-emergency-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 8px 20px;
          border-radius: 24px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cc-emergency-cancel:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        @keyframes cc-pulse-warning {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        @keyframes cc-fade-in-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cc-slide-up-modal {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes cc-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes cc-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes cc-pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        /* Mobile adaptation */
        @media (max-width: 480px) {
          .cc-chat-panel {
            width: calc(100% - 40px);
            right: 20px;
            bottom: 90px;
            height: 480px;
          }
        }
      `}</style>

      {/* Floating Trigger Button */}
      <button className="cc-widget-btn" onClick={toggleChat} title="CareConnect AI Doctor">
        <i className={isOpen ? "bi bi-x-lg" : "bi bi-chat-dots-fill"}></i>
      </button>

      {/* Chat Window Panel */}
      <div className={`cc-chat-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cc-chat-header">
          <div className="cc-chat-title">
            <i className="bi bi-heart-pulse-fill"></i>
            <span>CareConnect AI Doctor</span>
          </div>
          <div className="cc-chat-header-actions">
            <button 
              className={`cc-voice-toggle ${voiceEnabled ? 'active' : ''}`} 
              onClick={handleVoiceToggle}
              title={voiceEnabled ? "Voice Enabled - Click to Mute" : "Voice Muted - Click to Enable Speech"}
            >
              <i className={voiceEnabled ? "bi bi-volume-up-fill" : "bi bi-volume-mute-fill"}></i>
              <span>Voice</span>
            </button>
            <button className="cc-chat-close" onClick={toggleChat}>
              <i className="bi bi-dash"></i>
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="cc-chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`cc-message-row ${msg.isBot ? 'bot' : 'user'}`}>
              <div className="cc-message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="cc-typing-row">
              <div className="cc-typing-bubble">
                <div className="cc-dot"></div>
                <div className="cc-dot"></div>
                <div className="cc-dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="cc-chat-input-container">
          <button 
            type="button" 
            className={`cc-mic-btn ${isListening ? 'active' : ''}`}
            onClick={handleMicClick}
            title={isListening ? "Listening... click to stop" : "Speak your query"}
          >
            <i className="bi bi-mic-fill"></i>
          </button>
          <input 
            type="text" 
            className="cc-chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your wellness query..."}
            disabled={isListening}
          />
          <button 
            type="submit" 
            className="cc-send-btn" 
            disabled={!inputValue.trim() || isListening}
            title="Send Message"
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>

      {/* Full-Screen Emergency Modal */}
      {isEmergency && (
        <div className="cc-emergency-backdrop">
          <div className="cc-emergency-modal">
            <i className="bi bi-exclamation-triangle-fill cc-emergency-icon"></i>
            <h3 className="cc-emergency-title">Medical Emergency Detected</h3>
            <p className="cc-emergency-desc">
              Your description indicates a critical symptom or urgent health situation. 
              Please take immediate action. Use the direct buttons below to call for help.
            </p>
            <div className="cc-emergency-actions">
              <a href="tel:108" className="cc-emergency-btn cc-btn-ambulance">
                <i className="bi bi-telephone-fill"></i>
                Call Ambulance (108)
              </a>
              <a href={`tel:${user?.emergencyContact || '+18005550199'}`} className="cc-emergency-btn cc-btn-contact">
                <i className="bi bi-shield-fill-plus"></i>
                Call Emergency Contact ({user?.emergencyContact || 'CareConnect Support'})
              </a>
            </div>
            <button className="cc-emergency-cancel" onClick={() => setIsEmergency(false)}>
              I am OK, dismiss warning and continue chat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
