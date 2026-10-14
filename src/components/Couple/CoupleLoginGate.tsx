import React, { useState, useEffect } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Language, CoupleEvent } from '../../types';

interface CoupleLoginGateProps {
  children: React.ReactNode;
  lang: Language;
  couple: CoupleEvent;
}

export function CoupleLoginGate({ children, lang, couple }: CoupleLoginGateProps) {
  const sessionKey = `couple_auth_${couple.id}`;
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(sessionKey) === 'true' || localStorage.getItem(sessionKey) === 'true';
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no auth details are set for this couple, let them in automatically (for backward compatibility)
  const requiresAuth = !!(couple.manageUsername || couple.managePassword);

  useEffect(() => {
    // Check session for this specific couple
    try {
      const storedAuth = sessionStorage.getItem(sessionKey) === 'true' || localStorage.getItem(sessionKey) === 'true';
      setIsAuthenticated(storedAuth);
    } catch {
      setIsAuthenticated(false);
    }
    setUsername('');
    setPassword('');
    setError(null);
  }, [couple.id, sessionKey]);

  if (!requiresAuth || isAuthenticated) {
    return <>{children}</>;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validUsername = (couple.manageUsername || '').trim().toLowerCase();
    const validPassword = couple.managePassword || '';

    // If both are required but only one is set, we still check what's set.
    const isUsernameMatch = !validUsername || username.trim().toLowerCase() === validUsername;
    const isPasswordMatch = !validPassword || password === validPassword;

    if (isUsernameMatch && isPasswordMatch) {
      try {
        sessionStorage.setItem(sessionKey, 'true');
        localStorage.setItem(sessionKey, 'true');
      } catch (err) {
        console.warn('Could not save session', err);
      }
      setIsAuthenticated(true);
    } else {
      setError(lang === 'km' ? 'ឈ្មោះអ្នកប្រើប្រាស់ ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ!' : 'Invalid username or password!');
    }
  };

  return (
    <div className="min-h-[calc(100dvh-60px)] bg-[#FDFBF7] flex flex-col items-center justify-center p-4 py-6 sm:py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-[#EAE6E1] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Luxury Gold Lock & Couple Names */}
        <div className="p-6 sm:p-7 text-center bg-gradient-to-b from-amber-50/90 via-amber-50/30 to-white border-b border-amber-100/50">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl shadow-xs border border-amber-200/80 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-khmer-title text-gray-900 mb-1">
            {lang === 'km' ? 'ចូលផ្ទាំងគ្រប់គ្រងសំបុត្រ' : 'Manage Invitation'}
          </h2>
          <p className="text-xs sm:text-sm text-[#8C6D1F] font-normal">
            {lang === 'km' ? `${couple.groomNameKh} និង ${couple.brideNameKh}` : `${couple.groomNameEn} & ${couple.brideNameEn}`}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 pt-5">
          <form onSubmit={handleLogin} className="space-y-4">
            {couple.manageUsername && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
                  {lang === 'km' ? 'ឈ្មោះអ្នកប្រើប្រាស់' : 'Username'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={lang === 'km' ? 'បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់...' : 'Enter username...'}
                    autoComplete="username"
                    autoCapitalize="none"
                    className="w-full pl-11 pr-4 py-3 text-[16px] bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-sans"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {couple.managePassword && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
                  {lang === 'km' ? 'លេខកូដសម្ងាត់' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-11 py-3 text-[16px] bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 text-center animate-in fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: '#D4AF37',
                backgroundImage: 'linear-gradient(135deg, #E6C86E 0%, #D4AF37 50%, #B8962D 100%)',
                color: '#ffffff',
                WebkitAppearance: 'none'
              }}
              className="w-full py-3.5 bg-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-[#C5A028] to-[#B8962D] text-white text-xs sm:text-sm font-medium rounded-xl shadow-md hover:brightness-105 transition-all active:scale-[0.99] cursor-pointer"
            >
              {lang === 'km' ? 'ចូលប្រើប្រាស់' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
