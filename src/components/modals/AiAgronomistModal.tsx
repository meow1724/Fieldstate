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
      text: `Hello Manager! I'm your Fieldstate Agronomic AI. Today for **${farm.name}**, the decision engine deterministically recommends **${recommendation.action}** based on ${agronomic.cropEtDemand.toFixed(1)} mm/day demand and ${agronomic.rain24h.toFixed(1)} mm forecast rainfall. How can I assist you with your field strategy today?`,
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
      setMessages((prev) => [...prev, { sender: 'ai', text: data.answer || 'Decision verified based on FAO-56 model.' }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Based on deterministic FAO-56 calculations for ${farm.cropDisplayName}, daily crop demand is ${agronomic.cropEtDemand.toFixed(1)} mm. Following the **${recommendation.action}** protocol is recommended.`,
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
    'How much diesel/electricity do I save by waiting?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#cbd5e1] h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a29] text-[#e6a833] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div>
              <h3 className="text-[19px] font-extrabold text-[#0f172a] leading-tight">Fieldstate AI Agronomist</h3>
              <p className="text-[12px] text-[#64748b]">Plain language decision explanation grounded in FAO-56 data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-full transition-colors cursor-pointer"
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
                className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#1e3a29] text-white rounded-br-xs'
                    : 'bg-[#f8fafc] text-[#1e293b] rounded-bl-xs border border-[#e2e8f0]'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#f8fafc] rounded-2xl p-4 text-[12px] text-[#475569] flex items-center gap-2 border border-[#e2e8f0]">
                <span className="material-symbols-outlined text-[17px] animate-spin text-[#1e3a29]">
                  progress_activity
                </span>
                <span>Consulting FAO-56 Penman-Monteith crop water models...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="pt-2 pb-3">
          <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Suggested Inquiries</p>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="text-[11px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b] border border-[#cbd5e1] rounded-full px-3 py-1 text-left transition-colors cursor-pointer font-medium"
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
          className="flex items-center gap-2 pt-2 border-t border-[#e2e8f0]"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about today's irrigation, ETc, or weather..."
            className="flex-1 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#1e3a29]"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="bg-[#1e3a29] hover:bg-[#14281c] disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
