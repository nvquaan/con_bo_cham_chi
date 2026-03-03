import React, { useState, useEffect, useMemo } from 'react';
import { User, LogOut, Calendar, History, Send, Clock, Settings, X, Edit2, Check, AlertCircle, Heart, Sparkles } from 'lucide-react';
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
      setErrorMessage("Vui lòng cấu hình trước khi cày!");
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

      if (!response.ok) throw new Error(`Máy chủ từ chối (${response.status})`);
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
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6 md:gap-8 px-4 md:px-8 py-8">
      
      {/* Soft Decorative Blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 translate-x-32 -translate-y-32" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 -translate-x-24 translate-y-24" />

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-xl border border-pink-100 rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-pink-500" /> Cấu hình
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Basic Auth</label>
                <input
                  type="password"
                  value={basicAuth}
                  onChange={(e) => setBasicAuth(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Token</label>
                <textarea
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl font-mono text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all custom-scrollbar"
                />
              </div>

              <button
                onClick={saveSettings}
                className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-semibold rounded-xl shadow-md shadow-pink-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-pink-100 rounded-3xl shadow-lg shadow-pink-100/50 p-5 md:p-6 flex items-center justify-between gap-4 transition-all hover:shadow-xl hover:shadow-pink-100/60">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center shadow-inner">
            <User className="text-pink-500 w-7 h-7 md:w-8 md:h-8" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-2xl font-bold text-slate-800">{username}</h2>
              <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors">
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <p className="text-sm md:text-base font-medium text-slate-500 mt-0.5">Mã số: <span className="text-pink-500">{userID}</span></p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-white border border-pink-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 rounded-xl transition-all font-semibold text-sm shadow-sm"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Side: Control */}
        <div className="lg:col-span-7 bg-white/80 backdrop-blur-xl border border-pink-100 rounded-3xl shadow-lg shadow-pink-100/50 p-6 md:p-8 flex flex-col gap-8">
          <div className="flex items-center gap-3 pb-4 border-b border-pink-100">
            <div className="p-2 bg-pink-100 rounded-xl">
              <Clock className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Gieo giờ đẹp</h3>
          </div>

          <div className="space-y-6">
            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Ngày làm việc</label>
              <div 
                onClick={() => setIsCalendarOpen(true)}
                className="bg-white border border-pink-200 rounded-2xl p-4 md:p-5 flex items-center justify-between cursor-pointer hover:border-pink-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-50 rounded-xl group-hover:bg-pink-100 transition-colors">
                    <Calendar className="w-6 h-6 text-pink-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 mb-0.5">Đã chọn</span>
                    <span className="text-lg md:text-xl font-bold text-slate-800">{displayDate()}</span>
                  </div>
                </div>
                <div className="text-pink-400 group-hover:translate-x-1 transition-transform">
                  <Edit2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Trạng thái</label>
              <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1">
                <button
                  onClick={() => setType(CheckType.IN)}
                  className={`flex-1 py-3 text-sm md:text-base font-semibold rounded-xl transition-all ${
                    type === CheckType.IN 
                      ? 'bg-white text-pink-500 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  Check-in
                </button>
                <button
                  onClick={() => setType(CheckType.OUT)}
                  className={`flex-1 py-3 text-sm md:text-base font-semibold rounded-xl transition-all ${
                    type === CheckType.OUT 
                      ? 'bg-white text-pink-500 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  Check-out
                </button>
              </div>
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Giờ chốt</label>
              <div className={`relative flex items-center border rounded-2xl p-1.5 transition-all ${
                isTimeEditable 
                  ? (isTimeValid ? 'bg-white border-pink-300 shadow-sm ring-2 ring-pink-100' : 'bg-rose-50 border-rose-300 ring-2 ring-rose-100') 
                  : 'bg-slate-50 border-pink-100'
              }`}>
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  disabled={!isTimeEditable}
                  className={`flex-1 bg-transparent px-4 py-3 font-mono text-xl md:text-2xl font-bold focus:outline-none ${!isTimeValid && isTimeEditable ? 'text-rose-500' : 'text-slate-800'}`}
                />
                <button
                  onClick={() => setIsTimeEditable(!isTimeEditable)}
                  className={`p-3 rounded-xl transition-colors ${
                    isTimeEditable 
                      ? 'bg-pink-500 text-white shadow-sm' 
                      : 'bg-white text-slate-400 hover:text-pink-500 hover:bg-pink-50 shadow-sm border border-slate-100'
                  }`}
                >
                  {isTimeEditable ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
              </div>
              {!isTimeValid && isTimeEditable && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 ml-1">Định dạng chuẩn: HH:mm:ss</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isTimeValid}
              className="w-full mt-2 py-4 md:py-5 bg-gradient-to-r from-pink-400 to-rose-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Chốt đơn đi cày
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Logs & Info */}
        <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
          
          {/* Quẻ Info Box */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl shadow-lg shadow-pink-200 p-6 md:p-8 text-white flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/3 -translate-x-1/4"></div>
            
            <div className="flex items-center justify-between border-b border-white/20 pb-4 relative z-10">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Quẻ giờ đẹp
              </span>
              <div className="flex gap-1.5">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse" style={{animationDelay: `${i * 150}ms`}} />)}
              </div>
            </div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-bold font-mono tracking-tight">{sampleTimes.in}</span>
                <span className="text-xs font-medium text-white/70 mt-1.5">Check-in</span>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="flex flex-col items-end">
                <span className="text-3xl md:text-4xl font-bold font-mono tracking-tight">{sampleTimes.out}</span>
                <span className="text-xs font-medium text-white/70 mt-1.5">Check-out</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-pink-100 rounded-3xl shadow-lg shadow-pink-100/50 flex flex-col flex-1 min-h-[350px]">
            <div className="p-5 md:p-6 border-b border-pink-100 flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-xl">
                <History className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Nhật ký</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 py-8">
                  <History className="w-12 h-12 mb-3 text-pink-300" />
                  <p className="font-medium text-slate-500">Chưa có lịch sử</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-4 rounded-2xl border transition-all ${log.error ? 'bg-rose-50 border-rose-100' : 'bg-white border-pink-100 hover:border-pink-200 hover:shadow-sm'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${log.error ? 'text-rose-500' : (log.typeCheckInOut === CheckType.IN ? 'text-pink-500' : 'text-rose-400')}`}>
                          {log.error ? 'Thất bại' : (log.typeCheckInOut === CheckType.IN ? 'Vào làm' : 'Tan ca')}
                        </span>
                        <p className={`text-base font-bold font-mono ${log.error ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {log.dateCheckInOut}
                        </p>
                      </div>
                      <div className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-100">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {log.error && (
                      <div className="flex items-start gap-1.5 pt-2 mt-2 border-t border-rose-100">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-rose-600 leading-tight">{log.error}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer warning */}
      <div className="mt-2 flex items-center justify-center gap-2 text-slate-400">
        <Heart className="w-4 h-4 text-pink-300" />
        <p className="text-xs font-medium">
          Làm việc chăm chỉ, nghỉ ngơi hợp lý
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
