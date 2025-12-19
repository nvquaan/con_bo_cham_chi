
import React, { useState } from 'react';
import { User, Shield, LogIn, Lock, Sparkles, AlertTriangle } from 'lucide-react';

interface AuthPageProps {
  onAuthenticated: (username: string, userId: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [inputUserID, setInputUserID] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !inputUserID) {
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onAuthenticated(accountName, inputUserID);
  };

  return (
    <div className="relative w-full max-w-md px-4 py-12 flex flex-col items-center">
      {/* Background Decorative Shapes */}
      <div className="absolute top-10 left-0 w-32 h-32 bg-amber-400 border-4 border-slate-900 -rotate-12 -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-0 w-24 h-24 bg-orange-500 border-4 border-slate-900 rounded-full rotate-12 -z-10 animate-bounce delay-700" />
      
      <div className="relative w-full bg-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_#0f172a] p-8 md:p-10 transition-all duration-300 transform">
        
        {/* Logo/Icon Section */}
        <div className="mb-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-amber-400 border-4 border-slate-900 flex items-center justify-center shadow-[6px_6px_0px_0px_#0f172a] mb-6 animate-float cursor-pointer">
            <Lock className="w-10 h-10 text-slate-900" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-orange-600 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-1 uppercase italic tracking-tighter">
            CON BÒ <span className="text-amber-500 underline decoration-4 underline-offset-4">CHĂM CHỈ</span>
          </h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            Gieo thời gian ngẫu nhiên
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500 delay-100 fill-mode-both">
            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3 stroke-[3px]" /> Tên tài khoản
            </label>
            <input
              type="text"
              placeholder="Nhập tên của bạn..."
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-4 py-4 bg-slate-100 border-3 border-slate-900 text-slate-900 focus:outline-none focus:bg-white focus:translate-x-[4px] focus:translate-y-[4px] focus:shadow-none transition-all duration-200 font-bold placeholder:text-slate-400 shadow-[4px_4px_0px_0px_#0f172a]"
              required
            />
          </div>

          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500 delay-200 fill-mode-both">
            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-3 h-3 stroke-[3px]" /> Mã số nhân viên
            </label>
            <input
              type="text"
              placeholder="Ví dụ: FIS-12345"
              value={inputUserID}
              onChange={(e) => setInputUserID(e.target.value)}
              className="w-full px-4 py-4 bg-slate-100 border-3 border-slate-900 text-slate-900 focus:outline-none focus:bg-white focus:translate-x-[4px] focus:translate-y-[4px] focus:shadow-none transition-all duration-200 font-bold placeholder:text-slate-400 shadow-[4px_4px_0px_0px_#0f172a]"
              required
            />
          </div>

          {/* Neo Brutalist Button */}
          <button
            type="submit"
            disabled={isLoading || !accountName || !inputUserID}
            className="group relative w-full mt-2 py-4 bg-amber-400 border-3 border-slate-900 text-slate-900 font-black rounded-none flex items-center justify-center gap-3 transition-all duration-200 shadow-[6px_6px_0px_0px_#0f172a] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] disabled:bg-slate-200 disabled:border-slate-400 disabled:text-slate-400 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-sm md:text-base uppercase tracking-tight">Bắt đầu cày cuốc</span>
                <LogIn className="w-5 h-5 stroke-[3px] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Status/Warning Section */}
        <div className="mt-8 flex flex-col items-center gap-3 animate-in fade-in duration-700 delay-500 fill-mode-both">
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 border-2 border-slate-900">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Cày thuê 24/7</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-red-600 animate-shake">
            <AlertTriangle className="w-3 h-3 fill-red-600 text-white stroke-[2px]" />
            <p className="text-[10px] font-black uppercase tracking-tighter">
              CẤM ĐƯỢC NGHỊCH LINH TINH
            </p>
          </div>
        </div>
      </div>
      
      {/* Small floating quote */}
      <div className="mt-6 bg-white border-2 border-slate-900 px-3 py-1 shadow-[4px_4px_0px_0px_#0f172a] -rotate-2 animate-pulse">
        <p className="text-[10px] font-bold text-slate-900 italic">"Có làm thì mới có ăn..."</p>
      </div>
    </div>
  );
};

export default AuthPage;
