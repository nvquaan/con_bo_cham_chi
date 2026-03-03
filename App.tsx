import React, { useState, useCallback, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

interface UserInfo {
  username: string;
  id: string;
}

const App: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const savedUsername = localStorage.getItem('saved_username');
    const savedId = localStorage.getItem('saved_userid');
    if (savedUsername && savedId) {
      setUserInfo({ username: savedUsername, id: savedId });
    }
    setIsChecking(false);
  }, []);

  const handleAuth = useCallback((username: string, id: string) => {
    localStorage.setItem('saved_username', username);
    localStorage.setItem('saved_userid', id);
    setUserInfo({ username, id });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('saved_username');
    localStorage.removeItem('saved_userid');
    setUserInfo(null);
  }, []);

  if (isChecking) {
    return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center"></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col items-center justify-center p-4 selection:bg-pink-200 selection:text-pink-900">
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
