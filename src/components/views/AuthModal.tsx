import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { LoginView } from './LoginView';
import { SignupView } from './SignupView';
import { ForgotPasskeyView } from './ForgotPasskeyView';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemUsers: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterUser: (newUser: UserAccount) => void;
  onUpdateUserCredentials: (emailOrPhone: string, newPass: string, newPin: string) => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  systemUsers,
  onLoginSuccess,
  onRegisterUser,
  onUpdateUserCredentials,
  initialMode = 'login',
}) => {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup' | 'forgot'>(
    initialMode
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {currentScreen === 'login' && (
          <LoginView
            systemUsers={systemUsers}
            onLoginSuccess={(user) => {
              onLoginSuccess(user);
              onClose();
            }}
            onGoToSignup={() => setCurrentScreen('signup')}
            onGoToForgotPasskey={() => setCurrentScreen('forgot')}
            onClose={onClose}
          />
        )}

        {currentScreen === 'signup' && (
          <SignupView
            systemUsers={systemUsers}
            onRegisterUser={(newUser) => {
              onRegisterUser(newUser);
            }}
            onGoToLogin={() => setCurrentScreen('login')}
            onClose={onClose}
          />
        )}

        {currentScreen === 'forgot' && (
          <ForgotPasskeyView
            systemUsers={systemUsers}
            onUpdateUserCredentials={(emailOrPhone, newPass, newPin) => {
              onUpdateUserCredentials(emailOrPhone, newPass, newPin);
            }}
            onGoToLogin={() => setCurrentScreen('login')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};
