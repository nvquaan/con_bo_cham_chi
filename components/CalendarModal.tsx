
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../utils';

interface CalendarModalProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ selectedDate, onSelect, onClose }) => {
  const [year, month] = selectedDate.split('-').map(Number);
  const [viewDate, setViewDate] = useState({ month: month - 1, year: year });

  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);

  const prevMonth = () => {
    setViewDate(prev => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewDate(prev => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleDateClick = (d: number) => {
    const formattedDate = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onSelect(formattedDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_#0f172a] w-full max-w-[360px] p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b-3 border-slate-900 pb-3">
          <h3 className="text-base font-black text-slate-900 uppercase italic">Lịch cày bừa</h3>
          <button onClick={onClose} className="p-1 border-2 border-slate-900 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 border-2 border-slate-900 bg-amber-400 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-xl font-black text-slate-900 uppercase italic">{monthNames[viewDate.month]}</p>
            <p className="text-xs font-black text-slate-400">{viewDate.year}</p>
          </div>
          <button onClick={nextMonth} className="p-2 border-2 border-slate-900 bg-amber-400 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map(d => (
            <div key={d} className="text-[10px] font-black text-slate-900 text-center py-2 uppercase tracking-tighter">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const isSelected = isSameDay(selectedDate, viewDate.year, viewDate.month, d);
            return (
              <button
                key={d}
                onClick={() => handleDateClick(d)}
                className={`
                  aspect-square flex items-center justify-center border-2 text-sm font-black transition-all
                  ${isSelected 
                    ? 'bg-amber-400 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] scale-105' 
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                {d}
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={() => {
            const today = new Date();
            const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            onSelect(formatted);
            onClose();
          }}
          className="py-3 border-3 border-slate-900 bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_0px_0px_#f59e0b] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          Quay về hôm nay
        </button>
      </div>
    </div>
  );
};

export default CalendarModal;
