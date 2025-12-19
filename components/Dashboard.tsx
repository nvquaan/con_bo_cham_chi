
import React, { useState, useEffect, useMemo } from 'react';
import { User, LogOut, Calendar, CheckCircle2, History, Send, Clock, Settings, X, Edit2, Check, AlertCircle } from 'lucide-react';
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

  // State cho việc tùy chỉnh thời gian
  const [customTime, setCustomTime] = useState('');
  const [isTimeEditable, setIsTimeEditable] = useState(false);

  // Validate format HH:mm:ss
  const isTimeValid = useMemo(() => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    return timeRegex.test(customTime);
  }, [customTime]);

  const sampleTimes = useMemo(() => ({
    in: generateRandomTime(CheckType.IN),
    out: generateRandomTime(CheckType.OUT)
  }), [selectedDate, lastSubmission]);

  // Cập nhật customTime mỗi khi quẻ giờ đẹp thay đổi hoặc đổi trạng thái In/Out
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
    if (!isTimeValid) return; // Bảo vệ thêm nếu UI bị bypass

    if (!basicAuth || !accessToken) {
      setErrorMessage("Cấu hình 'sức mạnh' (Auth/Token) trước khi cày!");
      setIsSettingsOpen(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setLastSubmission(null);
    
    // Sử dụng customTime thay vì currentTimeToSubmit mặc định
    const formattedDate = formatPayloadDate(selectedDate, customTime);

    const params = new URLSearchParams({
      userId: userID,
      typeCheckInOut: type.toString(),
      dateCheckInOut: formattedDate
    });

    const fullUrl = `${PROXY_PATH}?${params.toString()}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'username': username,
          'token': accessToken,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Máy chủ từ chối cày.`);
      }
      
      const result = await response.json();
      
      if (result.resultCode === 1) {
        const newLog: LogEntry = {
          userID,
          typeCheckInOut: type,
          dateCheckInOut: formattedDate,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        };
        
        setLogs(prev => [newLog, ...prev].slice(0, 10));
        setLastSubmission({ time: customTime, type });
      } else {
        throw new Error(result.message || "Thất bại khi chấm công.");
      }
    } catch (error) {
      console.error("API Error:", error);
      let msg = error instanceof Error ? error.message : "Sự cố mạng khi cày bừa.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDate = () => {
    if (!selectedDate) return 'Chọn ngày';
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
  };

  return (
    <div className="w-full max-w-6xl flex flex-col gap-3 md:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 px-3 md:px-6">
      
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[360px] rounded-[1.5rem] md:rounded-[2rem] shadow-2xl p-6 md:p-8 border border-slate-100 overflow-hidden text-left">
            <div className="flex justify-between items-center mb-4 md:mb-5">
              <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2 uppercase">
                <Settings className="w-5 h-5 text-amber-500" />
                Sức mạnh
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">BASIC AUTH</label>
                <input
                  type="password"
                  placeholder="Basic c3NkX2F..."
                  value={basicAuth}
                  onChange={(e) => setBasicAuth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-mono text-xs md:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">TOKEN</label>
                <textarea
                  placeholder="Token cày thuê..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-mono text-xs md:text-sm h-24 resize-none"
                />
              </div>

              <button
                onClick={saveSettings}
                className="w-full py-3.5 bg-amber-600 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg uppercase tracking-wider active:scale-95 transition-transform"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-3 md:p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <div className="w-11 h-11 md:w-16 md:h-16 bg-amber-50 rounded-xl md:rounded-[1.5rem] flex items-center justify-center border border-amber-100 shadow-inner flex-shrink-0">
            <User className="text-amber-600 w-6 h-6 md:w-9 md:h-9" />
          </div>
          <div className="text-left min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 md:gap-2">
              <h2 className="text-sm md:text-2xl font-bold text-slate-800 truncate leading-none">Con bò: {username}</h2>
              <button onClick={() => setIsSettingsOpen(true)} className="p-0.5 text-slate-300 hover:text-amber-500 transition-colors">
                <Settings className="w-3.5 h-3.5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-1 md:mt-2">
              <span className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-tighter leading-tight">MÃ SỐ:</span>
              <span className="text-xs md:text-lg font-bold text-amber-600 truncate leading-tight uppercase tracking-tight">{userID}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-px h-8 md:h-14 bg-slate-100"></div>
          <button 
            onClick={onLogout}
            className="flex flex-col items-center justify-center px-2 py-0.5 text-slate-400 hover:text-red-500 transition-all"
          >
            <LogOut className="w-4 h-4 md:w-7 md:h-7 rotate-180" />
            <span className="text-[8px] md:text-xs font-bold uppercase tracking-tighter leading-none mt-1 md:mt-2">VỀ CHUỒNG</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-8 items-stretch">
        
        {/* Left Side: Control Card */}
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-md border border-slate-50 flex flex-col gap-4 md:gap-6 text-left">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
            </div>
            <h3 className="text-sm md:text-xl font-bold text-slate-800 uppercase tracking-tight">Xổ số giờ cày</h3>
          </div>

          <div className="space-y-4 md:space-y-6">
            {/* Date Input */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[11px] md:text-base font-bold text-slate-400 uppercase tracking-widest ml-1">HÔM NAY CÀY NGÀY MẤY?</label>
              <div 
                onClick={() => setIsCalendarOpen(true)}
                className="relative overflow-hidden rounded-xl md:rounded-[2rem] group cursor-pointer active:scale-[0.99] transition-transform shadow-sm"
              >
                <div className="bg-[#fffbeb] border border-amber-100 rounded-xl md:rounded-[2rem] p-4 md:p-6 flex items-center gap-3 md:gap-6 relative z-0 group-hover:bg-[#fff7d6] transition-colors">
                  <Calendar className="w-6 h-6 md:w-10 md:h-10 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-sm text-amber-400 font-bold uppercase tracking-widest leading-none mb-1 md:mb-2">Lịch cày bừa</span>
                    <span className="text-xl md:text-3xl font-bold text-slate-700 tracking-tight">{displayDate()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[11px] md:text-base font-bold text-slate-400 uppercase tracking-widest ml-1">TRẠNG THÁI CÀY</label>
              <div className="relative flex p-1 md:p-1.5 bg-[#fef3c7] rounded-xl md:rounded-2xl border border-amber-50 shadow-inner">
                <div 
                  className={`absolute top-1 md:top-1.5 bottom-1 md:bottom-1.5 w-[calc(50%-4px)] md:w-[calc(50%-6px)] bg-white rounded-lg md:rounded-xl shadow-sm transition-all duration-300 ease-out ${
                    type === CheckType.OUT ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />
                <button
                  onClick={() => setType(CheckType.IN)}
                  className={`relative z-10 flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-lg transition-colors ${
                    type === CheckType.IN ? 'text-amber-700' : 'text-amber-400'
                  }`}
                >
                  Check-in
                </button>
                <button
                  onClick={() => setType(CheckType.OUT)}
                  className={`relative z-10 flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-lg transition-colors ${
                    type === CheckType.OUT ? 'text-amber-700' : 'text-amber-400'
                  }`}
                >
                  Check-out
                </button>
              </div>
            </div>

            {/* Time Customization Input */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[11px] md:text-base font-bold text-slate-400 uppercase tracking-widest ml-1">GIỜ CÀY CỐ ĐỊNH</label>
              <div className={`relative flex items-center bg-slate-50 rounded-xl md:rounded-2xl border p-1 md:p-1.5 transition-all ${
                isTimeEditable 
                  ? (isTimeValid ? 'border-amber-400 ring-2 ring-amber-100' : 'border-red-400 ring-2 ring-red-100') 
                  : 'border-slate-100 shadow-inner'
              }`}>
                <div className="pl-3 md:pl-4">
                  <Clock className={`w-4 h-4 md:w-5 md:h-5 ${isTimeEditable ? (isTimeValid ? 'text-amber-500' : 'text-red-500') : 'text-slate-400'}`} />
                </div>
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  disabled={!isTimeEditable}
                  placeholder="HH:mm:ss"
                  className={`flex-1 bg-transparent px-3 py-2 md:py-3 font-mono text-sm md:text-xl font-bold focus:outline-none ${isTimeEditable ? (isTimeValid ? 'text-slate-800' : 'text-red-600') : 'text-slate-500'}`}
                />
                <button
                  onClick={() => setIsTimeEditable(!isTimeEditable)}
                  className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all ${isTimeEditable ? (isTimeValid ? 'bg-amber-500 text-white shadow-md' : 'bg-red-500 text-white shadow-md') : 'text-amber-600 hover:bg-amber-50'}`}
                >
                  {isTimeEditable ? <Check className="w-4 h-4 md:w-6 md:h-6" /> : <Edit2 className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
              {!isTimeValid && isTimeEditable && (
                <p className="text-[9px] md:text-xs text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">Định dạng chuẩn: HH:mm:ss (Ví dụ: 08:30:00)</p>
              )}
              <p className="text-[9px] md:text-xs text-slate-400 italic ml-1">* Mặc định là giờ đẹp hệ thống gieo quẻ.</p>
            </div>

            {/* Status Messages */}
            <div className="space-y-2 md:space-y-3">
              {lastSubmission && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-start gap-2.5 md:gap-4 animate-in zoom-in-95">
                  <CheckCircle2 className="text-emerald-500 w-4 h-4 md:w-6 md:h-6 mt-0.5" />
                  <div>
                    <p className="text-xs md:text-base font-bold text-emerald-900 leading-tight">Thành công!</p>
                    <p className="text-[10px] md:text-sm text-emerald-700 mt-1 font-medium">Đã chốt giờ: <span className="font-bold underline decoration-2">{lastSubmission.time}</span></p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-50 border border-red-100 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-start gap-2.5 md:gap-4 animate-in slide-in-from-top-2">
                  <AlertCircle className="text-red-500 w-4 h-4 md:w-6 md:h-6 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs md:text-base font-bold text-red-900 leading-tight">Sự cố cày bừa</p>
                    <p className="text-[10px] md:text-sm text-red-700 mt-1 leading-snug">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isTimeValid}
              className="w-full py-3.5 md:py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-300 text-white text-sm md:text-lg font-bold rounded-xl md:rounded-2xl shadow-lg active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2 md:gap-4"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 md:w-7 md:h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                  Chốt đơn đi cày
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Logs Card */}
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-md border border-slate-50 flex flex-col h-full min-h-[320px] md:min-h-[450px] text-left overflow-hidden relative">
          <div className="p-4 md:p-8 pb-2 md:pb-4 flex items-center gap-2 md:gap-4">
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <History className="w-4 h-4 md:w-6 md:h-6 text-slate-400" />
            </div>
            <h3 className="text-sm md:text-xl font-bold text-slate-800 uppercase tracking-tight">Nhật ký cày cuốc</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-2 md:py-4 custom-scrollbar pb-28 md:pb-40">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-200 gap-2 md:gap-3 opacity-50 py-6">
                <History className="w-8 h-8 md:w-16 md:h-16 stroke-[1.5]" />
                <p className="text-[10px] md:text-base font-bold uppercase tracking-widest">Chưa có lượt cày</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 md:p-6 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col gap-1 md:gap-2">
                      <span className={`text-[9px] md:text-xs font-bold tracking-widest ${log.typeCheckInOut === CheckType.IN ? 'text-amber-600' : 'text-orange-600'}`}>
                        {log.typeCheckInOut === CheckType.IN ? 'CHECK-IN' : 'CHECK-OUT'}
                      </span>
                      <p className="text-sm md:text-xl font-bold text-slate-700 font-mono leading-none tracking-tight">{log.dateCheckInOut}</p>
                    </div>
                    <span className="text-[10px] md:text-sm text-slate-400 font-bold bg-white px-2.5 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-slate-50 shadow-sm">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Info Box */}
          <div className="absolute bottom-3 md:bottom-6 right-3 md:right-8 left-3 md:left-8 bg-white/95 backdrop-blur-md border border-amber-100 shadow-xl rounded-xl md:rounded-[1.5rem] p-3 md:p-6 flex flex-col gap-2 md:gap-4 z-10">
            <div className="flex items-center justify-between border-b border-amber-50 pb-1.5 md:pb-3">
              <span className="text-[9px] md:text-xs font-bold text-amber-800 uppercase tracking-widest">Quẻ giờ đẹp</span>
              <div className="w-2 md:w-3 h-2 md:h-3 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex justify-between items-center px-0.5">
              <div className="flex flex-col">
                <span className="text-base md:text-2xl font-bold text-slate-700 font-mono tracking-tighter">{sampleTimes.in}</span>
                <span className="text-[8px] md:text-[11px] font-bold text-amber-500 uppercase mt-0.5">Vào</span>
              </div>
              <div className="w-px h-6 md:h-10 bg-slate-100"></div>
              <div className="flex flex-col items-end">
                <span className="text-base md:text-2xl font-bold text-slate-700 font-mono tracking-tighter">{sampleTimes.out}</span>
                <span className="text-[8px] md:text-[11px] font-bold text-orange-500 uppercase mt-0.5">Ra</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
