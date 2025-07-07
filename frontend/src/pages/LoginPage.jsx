import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { t } = useTranslation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => { e.preventDefault(); setError('');
    try { await auth.login(username, password); navigate(from, { replace: true });
    } catch (err) { setError(err.data?.message || 'Failed to login'); }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-20 gap-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-2xl">{t('loginPageTitle')}</CardTitle><CardDescription>{t('loginPageDesc')}</CardDescription></CardHeader>
        <form onSubmit={handleSubmit}><CardContent className="grid gap-4">
            <div className="grid gap-2"><label htmlFor="username">{t('usernameLabel')}</label><Input id="username" type="text" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
            <div className="grid gap-2"><label htmlFor="password">{t('passwordLabel')}</label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </CardContent><CardFooter><Button className="w-full" type="submit">{t('signIn')}</Button></CardFooter></form>
      </Card>
      <LanguageSwitcher/>
    </div>
  );
};
export default LoginPage;