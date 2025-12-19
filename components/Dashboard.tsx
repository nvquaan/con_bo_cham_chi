
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, LogOut, Calendar, CheckCircle2, History, Send, Clock, Settings, X, Save, AlertCircle } from 'lucide-react';
import { CheckType, LogEntry } from '../types';
import { generateRandomTime, formatPayloadDate, getTodayString } from '../utils';

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
  const [basicAuth, setBasicAuth] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const sampleTimes = useMemo(() => ({
    in: generateRandomTime(CheckType.IN),
    out: generateRandomTime(CheckType.OUT)
  }), [selectedDate, lastSubmission]);

  const currentTimeToSubmit = useMemo(() => {
    return type === CheckType.IN ? sampleTimes.in : sampleTimes.out;
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
    if (!basicAuth || !accessToken) {
      setErrorMessage("Chưa cấu hình 'sức mạnh' (Auth/Token), không thể đi cày!");
      setIsSettingsOpen(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setLastSubmission(null);
    
    const timeToSend = currentTimeToSubmit;
    const formattedDate = formatPayloadDate(selectedDate, timeToSend);

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
        throw new Error(`HTTP ${response.status}: Máy chủ không cho đi cày.`);
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
        setLastSubmission({ time: timeToSend, type });
      } else {
        throw new Error(result.message || "Ghi nhận công sức thất bại.");
      }
    } catch (error) {
      console.error("API Error:", error);
      let msg = error instanceof Error ? error.message : "Xảy ra sự cố cày bừa.";
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
    <div className="w-full max-w-md flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[320px] rounded-[2rem] shadow-2xl p-6 border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase">
                <Settings className="w-4 h-4 text-amber-500" />
                Sức mạnh
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">BASIC AUTH</label>
                <input
                  type="password"
                  placeholder="Basic c3NkX2F..."
                  value={basicAuth}
                  onChange={(e) => setBasicAuth(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-mono text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">TOKEN</label>
                <textarea
                  placeholder="Token cày thuê..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-mono text-[10px] h-20 resize-none"
                />
              </div>

              <button
                onClick={saveSettings}
                className="w-full py-3 bg-amber-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-amber-100 uppercase tracking-wider"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-[2rem] p-3 shadow-sm border border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-inner flex-shrink-0">
            <User className="text-amber-600 w-5 h-5" />
          </div>
          <div className="text-left min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[13px] font-black text-slate-800 truncate leading-none">Con bò: {username}</h2>
              <button onClick={() => setIsSettingsOpen(true)} className="p-1 text-slate-300 hover:text-amber-500">
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">MÃ SỐ CÀY CUỐC:</span>
              <span className="text-[10px] font-black text-amber-600 truncate leading-tight uppercase tracking-tight">{userID}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-px h-8 bg-slate-100"></div>
          <button 
            onClick={onLogout}
            className="flex flex-col items-center justify-center px-2 py-1 text-slate-400 hover:text-red-500 transition-all"
          >
            <LogOut className="w-3.5 h-3.5 rotate-180" />
            <span className="text-[8px] font-black uppercase tracking-tighter leading-none mt-1">VỀ CHUỒNG</span>
          </button>
        </div>
      </div>

      {/* Control Card */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-50 flex flex-col gap-4 text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Xổ số giờ cày</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">HÔM NAY CÀY NGÀY MẤY?</label>
            
            {/* Native Input Wrapper */}
            <div className="relative overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform">
              {/* Actual invisible input that captures ALL clicks */}
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
                style={{ 
                  fontSize: '16px', // Prevents iOS zoom on focus
                  colorScheme: 'light',
                  display: 'block'
                }}
              />
              
              {/* Visual Presentation UI */}
              <div className="bg-[#fffbeb] border border-amber-100 rounded-2xl p-4 flex items-center gap-4 relative z-0 pointer-events-none group-hover:bg-[#fff7d6] transition-colors">
                <Calendar className="w-6 h-6 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest leading-none mb-1">Lịch cày bừa</span>
                  <span className="text-xl font-black text-slate-700 tracking-tight">{displayDate()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">TRẠNG THÁI CÀY</label>
            <div className="relative flex p-1 bg-[#fef3c7] rounded-xl border border-amber-50">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${
                  type === CheckType.OUT ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <button
                onClick={() => setType(CheckType.IN)}
                className={`relative z-10 flex-1 py-2 rounded-lg font-black text-[11px] transition-colors ${
                  type === CheckType.IN ? 'text-amber-700' : 'text-amber-400'
                }`}
              >
                Check-in
              </button>
              <button
                onClick={() => setType(CheckType.OUT)}
                className={`relative z-10 flex-1 py-2 rounded-lg font-black text-[11px] transition-colors ${
                  type === CheckType.OUT ? 'text-amber-700' : 'text-amber-400'
                }`}
              >
                Check-out
              </button>
            </div>
          </div>

          {lastSubmission && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-3 animate-in zoom-in-95">
              <CheckCircle2 className="text-emerald-500 w-4 h-4 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-emerald-900 leading-tight">Cày thành công một cuốc!</p>
                <p className="text-[10px] text-emerald-700 mt-0.5">Giờ đẹp: <span className="font-bold">{lastSubmission.time}</span></p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 w-4 h-4 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-red-900 leading-tight">Sự cố cày bừa</p>
                <p className="text-[9px] text-red-700 mt-0.5 leading-snug">{errorMessage}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-300 text-white text-xs font-black rounded-2xl shadow-lg shadow-amber-200 uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Chốt đơn đi cày
              </>
            )}
          </button>
        </div>
      </div>

      {/* Logs Card */}
      <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-50 flex flex-col h-[300px] text-left overflow-hidden relative">
        <div className="p-6 pb-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
            <History className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Nhật ký cày cuốc</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar pb-20">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-200 gap-2 opacity-50">
              <History className="w-8 h-8 stroke-[1.5]" />
              <p className="text-[9px] font-black uppercase tracking-widest">Đang chờ lượt cày</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[8px] font-black tracking-widest ${log.typeCheckInOut === CheckType.IN ? 'text-amber-600' : 'text-orange-600'}`}>
                      {log.typeCheckInOut === CheckType.IN ? 'IN' : 'OUT'}
                    </span>
                    <p className="text-[11px] font-bold text-slate-700 font-mono leading-none">{log.dateCheckInOut}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-lg border border-slate-50">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="absolute bottom-4 right-6 left-6 bg-white border border-amber-50 shadow-xl rounded-2xl p-3 flex flex-col gap-1.5 z-10">
          <div className="flex items-center justify-between border-b border-amber-50 pb-1.5">
            <span className="text-[8px] font-black text-amber-800 uppercase tracking-widest">Quẻ giờ đẹp hôm nay</span>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-700 font-mono tracking-tighter">{sampleTimes.in}</span>
              <span className="text-[7px] font-bold text-amber-500 uppercase">Check-in</span>
            </div>
            <div className="w-px h-5 bg-slate-100"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-700 font-mono tracking-tighter">{sampleTimes.out}</span>
              <span className="text-[7px] font-bold text-orange-500 uppercase">Check-out</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
