
import React, { useState, useCallback } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

interface UserInfo {
  username: string;
  id: string;
}

const App: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleAuth = useCallback((username: string, id: string) => {
    setUserInfo({ username, id });
  }, []);

  const handleLogout = useCallback(() => {
    setUserInfo(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {!userInfo ? (
        <AuthPage onAuthenticated={handleAuth} />
      ) : (
        <Dashboard 
          userID={userInfo.id} 
          username={userInfo.username} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default App;
