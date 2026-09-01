'use client';

import { initializeUI } from '@firebase-oss/ui-core';
import {
  FirebaseUIProvider,
  ForgotPasswordAuthScreen,
  GoogleSignInButton,
  SignInAuthScreen,
  SignUpAuthScreen,
} from '@firebase-oss/ui-react';
import { jaJp } from '@firebase-oss/ui-translations';
import { sendEmailVerification } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { app, auth } from '../lib/firebase';

type Screen = 'signIn' | 'signUp' | 'forgotPassword';

export default function FirebaseAuthScreen() {
  const [screen, setScreen] = useState<Screen>('signIn');
  const [mounted, setMounted] = useState(false);
  const ui = useMemo(() => {
    if (!mounted || !app || !auth) {
      return null;
    }
    return initializeUI({ app, auth, locale: jaJp });
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignUp() {
    if (!auth) {
      throw new Error('Firebase is not configured.');
    }
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  if (!mounted) {
    return <main className="auth-message">読み込み中...</main>;
  }

  if (!ui || !auth) {
    return (
      <main className="auth-message" role="alert">
        Firebase の設定が不足しているため、ログイン画面を表示できません。
      </main>
    );
  }

  return (
    <FirebaseUIProvider ui={ui}>
      <main className="auth-screen">
        <section className="auth-panel" aria-label="妖精バイオームのログイン">
          <header className="auth-heading">
            <p>妖精バイオーム</p>
            <h1>{screen === 'signUp' ? 'アカウントをつくる' : screen === 'forgotPassword' ? 'パスワードを再設定' : 'ログイン'}</h1>
          </header>
          {screen === 'signIn' && (
            <SignInAuthScreen
              onSignUpClick={() => setScreen('signUp')}
              onForgotPasswordClick={() => setScreen('forgotPassword')}
            >
              <GoogleSignInButton themed="neutral" />
            </SignInAuthScreen>
          )}
          {screen === 'signUp' && (
            <SignUpAuthScreen onSignInClick={() => setScreen('signIn')} onSignUp={handleSignUp}>
              <GoogleSignInButton themed="neutral" />
            </SignUpAuthScreen>
          )}
          {screen === 'forgotPassword' && (
            <ForgotPasswordAuthScreen onBackToSignInClick={() => setScreen('signIn')} />
          )}
        </section>
      </main>
    </FirebaseUIProvider>
  );
}