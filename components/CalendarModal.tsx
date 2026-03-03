import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-xl border border-pink-100 shadow-2xl rounded-3xl w-full max-w-[360px] p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center border-b border-pink-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-pink-500" /> Chọn ngày
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 text-slate-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-base font-bold text-slate-800">{monthNames[viewDate.month]}</p>
            <p className="text-xs font-medium text-slate-400">{viewDate.year}</p>
          </div>
          <button onClick={nextMonth} className="p-2 text-slate-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map(d => (
            <div key={d} className="text-[10px] font-semibold text-slate-400 text-center py-1 uppercase">{d}</div>
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
                  aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-md shadow-pink-200 scale-105' 
                    : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'}
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
          className="py-3 mt-2 bg-slate-50 text-slate-600 hover:bg-pink-50 hover:text-pink-600 font-semibold text-sm rounded-xl transition-all"
        >
          Hôm nay
        </button>
      </div>
    </div>
  );
};

export default CalendarModal;
