
import React, { useState, useEffect, useMemo } from 'react';
import { User, LogOut, Calendar, CheckCircle2, History, Send, Clock, Settings, X, Edit2, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { CheckType, LogEntry } from '../types';
import { generateRandomTime, formatPayloadDate, getTodayString } from '../utils';
import CalendarModal from './CalendarModal';

interface DashboardProps {
  userID: string;
  username: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userID, username, onLogout }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [type, setType] = useState<CheckType>(CheckType.IN);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastSubmission, setLastSubmission] = useState<{ time: string; type: CheckType } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [basicAuth, setBasicAuth] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const [customTime, setCustomTime] = useState('');
  const [isTimeEditable, setIsTimeEditable] = useState(false);

  const isTimeValid = useMemo(() => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    return timeRegex.test(customTime);
  }, [customTime]);

  const sampleTimes = useMemo(() => ({
    in: generateRandomTime(CheckType.IN),
    out: generateRandomTime(CheckType.OUT)
  }), [selectedDate, lastSubmission]);

  useEffect(() => {
    const defaultTime = type === CheckType.IN ? sampleTimes.in : sampleTimes.out;
    setCustomTime(defaultTime);
    setIsTimeEditable(false);
  }, [type, sampleTimes]);

  const PROXY_PATH = '/api-proxy/apietms/api/ChechInData/MobileAddCheckInOut';

  useEffect(() => {
    const savedBasic = localStorage.getItem('sync_basic_auth') || '';
    const savedToken = localStorage.getItem('sync_access_token') || '';
    setBasicAuth(savedBasic);
    setAccessToken(savedToken);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('sync_basic_auth', basicAuth);
    localStorage.setItem('sync_access_token', accessToken);
    setIsSettingsOpen(false);
  };

  const handleSubmit = async () => {
    if (!isTimeValid) return;
    if (!basicAuth || !accessToken) {
      setErrorMessage("Cấu hình 'Sức mạnh' trước khi cày!");
      setIsSettingsOpen(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setLastSubmission(null);
    
    const formattedDate = formatPayloadDate(selectedDate, customTime);
    const params = new URLSearchParams({
      userId: userID,
      typeCheckInOut: type.toString(),
      dateCheckInOut: formattedDate
    });

    try {
      const response = await fetch(`${PROXY_PATH}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'username': username,
          'token': accessToken,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`Máy chủ từ chối cày (${response.status})`);
      const result = await response.json();
      
      if (result.resultCode === 1) {
        setLogs(prev => [{
          userID,
          typeCheckInOut: type,
          dateCheckInOut: formattedDate,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        }, ...prev].slice(0, 15));
        setLastSubmission({ time: customTime, type });
      } else {
        throw new Error(result.message || "Thất bại khi chấm công.");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Sự cố mạng.";
      setErrorMessage(errorMsg);
      // Ghi nhận lỗi vào logs
      setLogs(prev => [{
        userID,
        typeCheckInOut: type,
        dateCheckInOut: formattedDate,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        error: errorMsg
      }, ...prev].slice(0, 15));
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDate = () => {
    if (!selectedDate) return 'Chọn ngày';
    const [y, m, d] = selectedDate.split('-');
    return `${d}-${m}-${y}`;
  };

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6 md:gap-8 px-4 md:px-8 py-4">
      
      {/* Background Decor - Neo Brutalist */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-amber-400 border-b-4 border-l-4 border-slate-900 opacity-10 -z-10 rotate-12 translate-x-32 -translate-y-32" />
      <div className="fixed bottom-0 left-0 w-48 h-48 bg-orange-500 border-t-4 border-r-4 border-slate-900 opacity-10 -z-10 -rotate-12 -translate-x-24 translate-y-24" />

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <CalendarModal 
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-4 border-slate-900 shadow-[10px_10px_0px_0px_#0f172a] w-full max-w-md p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase italic">Cấu hình sức mạnh</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 border-2 border-slate-900 hover:bg-slate-100 transition-colors">
                <X className="w-6 h-6 text-slate-900" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-widest">BASIC AUTH</label>
                <input
                  type="password"
                  value={basicAuth}
                  onChange={(e) => setBasicAuth(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-3 border-slate-900 font-mono text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#f59e0b] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-widest">TOKEN CÀY THUÊ</label>
                <textarea
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-3 border-slate-900 font-mono text-sm h-32 resize-none focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#f59e0b] transition-all"
                />
              </div>

              <button
                onClick={saveSettings}
                className="w-full py-4 bg-amber-400 border-3 border-slate-900 text-slate-900 font-black uppercase shadow-[6px_6px_0px_0px_#0f172a] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] p-4 md:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-20 md:h-20 bg-amber-400 border-3 border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_0px_#0f172a]">
            <User className="text-slate-900 w-8 h-8 md:w-12 md:h-12" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-3xl font-black text-slate-900 uppercase italic">BÒ: {username}</h2>
              <button onClick={() => setIsSettingsOpen(true)} className="p-1 hover:text-amber-500 transition-colors">
                <Settings className="w-5 h-5 md:w-7 md:h-7" />
              </button>
            </div>
            <p className="text-xs md:text-lg font-black text-slate-500 uppercase tracking-tight">MÃ SỐ: <span className="text-amber-600 underline decoration-2">{userID}</span></p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="group flex flex-col items-center justify-center p-2 md:p-4 border-2 border-slate-900 hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_#0f172a] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
        >
          <LogOut className="w-6 h-6 md:w-8 md:h-8 rotate-180" />
          <span className="text-[10px] md:text-xs font-black uppercase mt-1">THOÁT</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Side: Control */}
        <div className="bg-white border-4 border-slate-900 shadow-[10px_10px_0px_0px_#0f172a] p-6 md:p-10 flex flex-col gap-8">
          <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-4">
            <Clock className="w-8 h-8 text-amber-500" />
            <h3 className="text-2xl font-black text-slate-900 uppercase italic">Gieo giờ đẹp</h3>
          </div>

          <div className="space-y-8">
            {/* Date Input */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Lịch cày bừa</label>
              <div 
                onClick={() => setIsCalendarOpen(true)}
                className="bg-amber-50 border-3 border-slate-900 p-5 md:p-7 flex items-center gap-6 cursor-pointer shadow-[6px_6px_0px_0px_#0f172a] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <Calendar className="w-8 h-8 md:w-12 md:h-12 text-slate-900" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-amber-600 uppercase mb-1">Ngày đã chọn</span>
                  <span className="text-2xl md:text-4xl font-black text-slate-900 font-mono tracking-tighter">{displayDate()}</span>
                </div>
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Trạng thái</label>
              <div className="flex border-3 border-slate-900 p-1 bg-slate-900 gap-1">
                <button
                  onClick={() => setType(CheckType.IN)}
                  className={`flex-1 py-3 md:py-4 text-sm md:text-xl font-black uppercase transition-all ${
                    type === CheckType.IN ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Check-in
                </button>
                <button
                  onClick={() => setType(CheckType.OUT)}
                  className={`flex-1 py-3 md:py-4 text-sm md:text-xl font-black uppercase transition-all ${
                    type === CheckType.OUT ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Check-out
                </button>
              </div>
            </div>

            {/* Time Input */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Giờ cố định</label>
              <div className={`relative flex items-center border-3 border-slate-900 p-1 transition-all ${
                isTimeEditable 
                  ? (isTimeValid ? 'bg-white shadow-[6px_6px_0px_0px_#f59e0b]' : 'bg-red-50 shadow-[6px_6px_0px_0px_#ef4444]') 
                  : 'bg-slate-100'
              }`}>
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  disabled={!isTimeEditable}
                  className={`flex-1 bg-transparent px-4 py-3 md:py-4 font-mono text-lg md:text-2xl font-black focus:outline-none ${!isTimeValid && isTimeEditable ? 'text-red-600' : 'text-slate-900'}`}
                />
                <button
                  onClick={() => setIsTimeEditable(!isTimeEditable)}
                  className={`p-3 md:p-4 border-l-3 border-slate-900 transition-colors ${isTimeEditable ? 'bg-slate-900 text-white' : 'text-slate-900 hover:bg-white'}`}
                >
                  {isTimeEditable ? <Check className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
                </button>
              </div>
              {!isTimeValid && isTimeEditable && (
                <p className="text-[10px] text-red-600 font-black uppercase mt-1 italic">Định dạng chuẩn: HH:mm:ss</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isTimeValid}
              className="w-full py-5 md:py-6 bg-amber-400 border-4 border-slate-900 text-slate-900 text-lg md:text-2xl font-black uppercase italic tracking-wider shadow-[8px_8px_0px_0px_#0f172a] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:bg-orange-500 disabled:bg-slate-200 disabled:border-slate-400 disabled:text-slate-400 disabled:shadow-none transition-all flex items-center justify-center gap-4"
            >
              {isSubmitting ? (
                <div className="w-8 h-8 border-4 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-6 h-6 stroke-[3px]" />
                  Chốt đơn đi cày
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Logs */}
        <div className="flex flex-col gap-8">
          <div className="bg-white border-4 border-slate-900 shadow-[10px_10px_0px_0px_#0f172a] flex flex-col h-full min-h-[400px]">
            <div className="p-6 md:p-8 border-b-4 border-slate-900 flex items-center gap-3">
              <History className="w-8 h-8 text-slate-900" />
              <h3 className="text-2xl font-black text-slate-900 uppercase italic">Nhật ký cày cuốc</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                  <History className="w-20 h-20 mb-4" />
                  <p className="font-black uppercase tracking-widest text-xl">Trống rỗng...</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-4 md:p-6 border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] flex flex-col gap-2 group transition-colors ${log.error ? 'bg-red-50' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase ${log.error ? 'text-red-600' : (log.typeCheckInOut === CheckType.IN ? 'text-amber-600' : 'text-orange-600')}`}>
                          {log.error ? '!! THẤT BẠI !!' : (log.typeCheckInOut === CheckType.IN ? '>> VÀO CHUỒNG' : '<< RA ĐỒNG')}
                        </span>
                        <p className={`text-base md:text-xl font-black font-mono italic ${log.error ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {log.dateCheckInOut}
                        </p>
                      </div>
                      <div className="bg-slate-900 text-white px-3 py-2 text-xs md:text-sm font-black">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {log.error && (
                      <div className="flex items-start gap-2 pt-2 border-t-2 border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-red-700 uppercase leading-tight italic">{log.error}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quẻ Info Box */}
          <div className="bg-slate-900 border-4 border-slate-900 shadow-[10px_10px_0px_0px_#f59e0b] p-6 md:p-8 text-white flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-2 border-slate-700 pb-4">
              <span className="text-xs font-black text-amber-400 uppercase tracking-[0.3em]">Quẻ giờ đẹp hên xui</span>
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />)}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-3xl md:text-5xl font-black font-mono tracking-tighter text-amber-400 italic">{sampleTimes.in}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase mt-2">Check-in gợi ý</span>
              </div>
              <div className="w-1 h-12 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                <span className="text-3xl md:text-5xl font-black font-mono tracking-tighter text-orange-500 italic">{sampleTimes.out}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase mt-2">Check-out gợi ý</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer warning */}
      <div className="mt-4 flex items-center justify-center gap-4 bg-white border-3 border-slate-900 py-3 shadow-[6px_6px_0px_0px_#0f172a] transform -rotate-1">
        <AlertCircle className="w-5 h-5 text-red-600 fill-red-600 text-white" />
        <p className="text-xs md:text-sm font-black uppercase text-slate-900 tracking-tighter italic">
          Cảnh báo: Có làm thì mới có ăn - Cấm được nghịch linh tinh!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
