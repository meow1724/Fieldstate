import React, { useState } from 'react';
import { FarmProfile } from '../../types';

interface ScheduleInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmProfile;
}

export const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({
  isOpen,
  onClose,
  farm,
}) => {
  const [date, setDate] = useState('2026-08-20');
  const [timeWindow, setTimeWindow] = useState('08:00 - 10:00 AM');
  const [quadrant, setQuadrant] = useState('Northeast Quadrant');
  const [assignedScout, setAssignedScout] = useState('Agronomy Field Team Beta');
  const [notes, setNotes] = useState('Inspect pale chlorosis and collect 30cm soil moisture core samples.');
  const [isScheduled, setIsScheduled] = useState(false);

  if (!isOpen) return null;

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduled(true);
    setTimeout(() => {
      setIsScheduled(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#c1c8c2]">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#c1c8c2]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a03f2e] text-[24px]">calendar_today</span>
            <h3 className="text-[20px] font-bold text-[#191c1c]">Schedule Field Inspection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#717973] hover:text-[#191c1c] rounded-full"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {isScheduled ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[#012d1d] text-[54px]">check_circle</span>
            <h4 className="text-[20px] font-bold text-[#191c1c]">Inspection Dispatched</h4>
            <p className="text-[14px] text-[#414844]">
              Work order assigned to {assignedScout} for {date} ({timeWindow}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSchedule} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#191c1c] mb-1">
                Target Field & Quadrant
              </label>
              <input
                type="text"
                disabled
                value={`${farm.name} • ${quadrant}`}
                className="w-full bg-[#f3f4f3] border border-[#c1c8c2] rounded-lg px-3.5 py-2 text-[14px] text-[#414844]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#191c1c] mb-1">
                  Inspection Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-3 py-2 text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#191c1c] mb-1">
                  Time Window
                </label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-3 py-2 text-[13px]"
                >
                  <option>06:00 - 08:00 AM (Early)</option>
                  <option>08:00 - 10:00 AM</option>
                  <option>02:00 - 04:00 PM</option>
                  <option>05:00 - 07:00 PM (Dusk)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#191c1c] mb-1">
                Assigned Scout / Team
              </label>
              <input
                type="text"
                value={assignedScout}
                onChange={(e) => setAssignedScout(e.target.value)}
                className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-3.5 py-2 text-[13px]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#191c1c] mb-1">
                Scout Instructions / Focus Areas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg p-3 text-[13px]"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#c1c8c2]/40">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#717973] text-[#191c1c] rounded-lg text-[13px] hover:bg-[#f3f4f3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#a03f2e] hover:bg-[#802919] text-white px-5 py-2 rounded-lg text-[13px] font-bold shadow-xs cursor-pointer"
              >
                Dispatch Scout Order
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
