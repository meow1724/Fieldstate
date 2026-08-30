import React, { useState } from 'react';
import { FarmProfile, AgronomicState, Recommendation, NdviReading } from '../../types';

interface AiAgronomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmProfile;
  agronomic: AgronomicState;
  recommendation: Recommendation;
  ndviReadings: NdviReading[];
}

export const AiAgronomistModal: React.FC<AiAgronomistModalProps> = ({
  isOpen,
  onClose,
  farm,
  agronomic,
  recommendation,
  ndviReadings,
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello Manager! I'm your AgriPulse Agronomic Advisor. Today for **${farm.name}**, the decision engine recommends **${recommendation.action}** based on ${agronomic.cropEtDemand.toFixed(1)} mm/day demand and ${agronomic.rain24h.toFixed(1)} mm rainfall forecast. How can I assist you with your field strategy today?`,
    },
  ]);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const textToSend = queryText || question;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { sender: 'user' as const, text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/ask-agronomist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          farm,
          agronomic,
          recommendation,
          ndviReadings,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: data.answer || 'No response generated.' }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Based on deterministic FAO-56 models for ${farm.cropDisplayName}, daily crop demand is ${agronomic.cropEtDemand.toFixed(1)} mm. Following the ${recommendation.action} protocol is recommended.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'Why shouldn’t I irrigate today?',
    'What happens if it only rains 10mm instead of 31mm?',
    'Explain the NDVI variance in the field',
    'How is Kc calculated for Day ' + agronomic.cropAgeDays + '?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#c1c8c2] h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#c1c8c2]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#1b4332] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#191c1c] leading-tight">AgriPulse AI Agronomist</h3>
              <p className="text-[12px] text-[#414844]">Climate-aware agronomic decision advisor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#717973] hover:text-[#191c1c] hover:bg-[#edeeed] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 flex flex-col gap-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-[14px] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#012d1d] text-white rounded-br-xs'
                    : 'bg-[#f3f4f3] text-[#191c1c] rounded-bl-xs border border-[#c1c8c2]/30'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#f3f4f3] rounded-2xl p-4 text-[13px] text-[#414844] flex items-center gap-2 border border-[#c1c8c2]/30">
                <span className="material-symbols-outlined text-[18px] animate-spin text-[#012d1d]">
                  progress_activity
                </span>
                <span>Consulting FAO-56 Penman-Monteith models...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Questions */}
        <div className="pt-2 pb-3">
          <p className="text-[11px] font-semibold text-[#717973] uppercase tracking-wider mb-2">Suggested Inquiries</p>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="text-[12px] bg-[#f9f9f8] hover:bg-[#c1ecd4]/50 text-[#191c1c] border border-[#c1c8c2]/60 rounded-full px-3 py-1 text-left transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2 pt-2 border-t border-[#c1c8c2]/40"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about today's irrigation, ETc, or weather..."
            className="flex-1 bg-[#f9f9f8] border border-[#c1c8c2] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#012d1d]"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="bg-[#012d1d] hover:bg-[#1b4332] disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
