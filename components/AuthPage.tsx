
import React, { useState } from 'react';
import { User, Shield, LogIn, Lock } from 'lucide-react';

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
      alert("Chưa nhập đủ thông tin sao cày được con bò ơi!");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    onAuthenticated(accountName, inputUserID);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center transition-all duration-300 transform hover:scale-[1.01]">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Con bò chăm chỉ</h1>
        <p className="text-slate-500 italic">Cày cuốc hăng say, vận may sẽ đến</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 text-left">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tên tài khoản cày thuê</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập tên tài khoản..."
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mã số con bò (User ID)</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Ví dụ: BO-9988"
              value={inputUserID}
              onChange={(e) => setInputUserID(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 shadow-lg shadow-amber-100"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Bắt đầu cày cuốc
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Đang sẵn sàng cho một ngày cày bừa
      </div>
    </div>
  );
};

export default AuthPage;
