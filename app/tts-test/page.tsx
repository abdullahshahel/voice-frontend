'use client';

import React, { useState, useRef } from 'react';

export default function AutoPlayBanglaTTS() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('bn-BD-NabanitaNeural');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Core TTS execution logic
  const generateTTS = async (textToSpeak: string, selectedVoice: string) => {
    if (!textToSpeak.trim()) return;
    setIsLoading(true);

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);

    try {
      
      const BACKEND_URL = "https://wild-trains-hunt.loca.lt";

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true' // <--- ADD THIS SECRET BYPASS HEADER
        },
        body: JSON.stringify({ text: textToSpeak, voice: selectedVoice })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP Error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Instantly play the incoming voice stream
      setTimeout(() => {
        audioRef.current?.play();
      }, 50);

    } catch (error: any) {
      console.error("TTS Error:", error);
      alert(`অডিও তৈরিতে সমস্যা হয়েছে: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // The Magic Interceptor: Catches Ctrl+V or Right-Click Paste
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    if (pastedText.trim()) {
      setText(pastedText); // Update the visual UI box
      generateTTS(pastedText, voice); // Instantly fire to Python backend
    }
  };

  // Manual fallback trigger in case they manually typed something instead of pasting
  const handleManualSubmit = () => {
    generateTTS(text, voice);
  };

  return (
    <div style={{ maxWidth: '620px', margin: '50px auto', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backgroundColor: '#ffffff', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold', color: '#0070f3' }}>
          অটোমেটিক বাংলা TTS স্টুডিও ⚡🤖
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          নিচে টেক্সট পেস্ট করা মাত্রই স্বয়ংক্রিয়ভাবে ভয়েস চালু হয়ে যাবে
        </p>
      </div>

      {/* Voice Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#444' }}>
          কণ্ঠস্বর (Select Voice):
        </label>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f8fafc', fontSize: '15px', outline: 'none' }}
        >
          <option value="bn-BD-NabanitaNeural">নবনীতা - Nabanita (বাংলাদেশ - নারী)</option>
          <option value="bn-BD-PradeepNeural">প্রদীপ - Pradeep (বাংলাদেশ - পুরুষ)</option>
          <option value="bn-IN-TanishaaNeural">তনিমা - Tanishaa (ভারত - নারী)</option>
          <option value="bn-IN-BashkarNeural">ভাস্কর - Bashkar (ভারত - পুরুষ)</option>
        </select>
      </div>

      {/* Automated Clipboard Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#444' }}>
          এখানে পেস্ট করুন (Ctrl + V / Right-Click Paste):
        </label>
        <textarea
          rows={7}
          value={text}
          onPaste={handlePaste} // Intercepts paste actions instantly
          onChange={(e) => setText(e.target.value)} // Allows manual corrections
          placeholder="যেকোনো বাংলা লেখা কপি করে এখানে পেস্ট করুন..."
          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: isLoading ? '2px solid #0070f3' : '1px solid #ddd', fontSize: '16px', lineHeight: '1.6', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
        />
      </div>

      {/* Status Bar / Manual Button */}
      <div style={{ textAlign: 'right', fontSize: '13px', color: '#666' }}>
        {isLoading ? (
          <span style={{ color: '#0070f3', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
            ⏳ প্রসেসিং হচ্ছে, দয়া করে শুনুন...
          </span>
        ) : text ? (
          <button 
            onClick={handleManualSubmit}
            style={{ background: 'none', border: 'none', color: '#0070f3', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
          >
            আবার শুনুন (Replay)
          </button>
        ) : (
          <span>সার্ভার প্রস্তুত...</span>
        )}
      </div>

      {/* Hidden/Visible Audio output handler */}
      {audioUrl && (
        <div style={{ marginTop: '25px', padding: '16px', backgroundColor: '#f0f4f8', borderRadius: '10px', borderLeft: '4px solid #0070f3' }}>
          <audio ref={audioRef} src={audioUrl} controls style={{ width: '100%', height: '40px' }} />
        </div>
      )}
    </div>
  );
}