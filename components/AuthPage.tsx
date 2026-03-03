import React, { useState } from 'react';
import { User, Shield, LogIn, Heart, Sparkles, AlertCircle } from 'lucide-react';

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
      {/* Soft Decorative Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700" />
      
      <div className="relative w-full bg-white/80 backdrop-blur-xl border border-pink-100 rounded-[2rem] shadow-2xl shadow-pink-100/50 p-8 md:p-10 transition-all duration-500">
        
        {/* Logo/Icon Section */}
        <div className="mb-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="relative w-20 h-20 bg-gradient-to-tr from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center shadow-inner mb-6">
            <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-rose-400 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
            Con Bò <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">Chăm Chỉ</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Hệ thống chấm công dễ thương
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
              <User className="w-4 h-4 text-pink-400" /> Tên tài khoản
            </label>
            <input
              type="text"
              placeholder="Nhập tên của bạn..."
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-5 py-4 bg-white/50 border border-pink-100 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 placeholder:text-slate-400 shadow-sm"
              required
            />
          </div>

          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
              <Shield className="w-4 h-4 text-pink-400" /> Mã số nhân viên
            </label>
            <input
              type="text"
              placeholder="Ví dụ: FIS-12345"
              value={inputUserID}
              onChange={(e) => setInputUserID(e.target.value)}
              className="w-full px-5 py-4 bg-white/50 border border-pink-100 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 placeholder:text-slate-400 shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !accountName || !inputUserID}
            className="group relative w-full mt-4 py-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-base">Bắt đầu cày cuốc</span>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Status/Warning Section */}
        <div className="mt-8 flex flex-col items-center gap-3 animate-in fade-in duration-700 delay-500 fill-mode-both">
          <div className="flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full border border-pink-100">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide">Sẵn sàng 24/7</span>
          </div>
        </div>
      </div>
      
      {/* Small floating quote */}
      <div className="mt-8 text-center animate-in fade-in duration-700 delay-700 fill-mode-both">
        <p className="text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-pink-400" />
          "Có làm thì mới có ăn..."
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
