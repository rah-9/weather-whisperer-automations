
import React from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import AuthPage from '../pages/AuthPage';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const user = useUser();

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
