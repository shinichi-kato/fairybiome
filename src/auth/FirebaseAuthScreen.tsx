'use client';

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { FormEvent, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

type Screen = 'signIn' | 'signUp' | 'forgotPassword';

const TITLES: Record<Screen, string> = {
  signIn: 'ログイン',
  signUp: 'アカウントをつくる',
  forgotPassword: 'パスワードを再設定',
};

const CREDENTIAL_ERROR = 'メールアドレスまたはパスワードが正しくありません。';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'メールアドレスの形式が正しくありません。',
  'auth/invalid-credential': CREDENTIAL_ERROR,
  'auth/wrong-password': CREDENTIAL_ERROR,
  'auth/user-not-found': CREDENTIAL_ERROR,
  'auth/user-disabled': 'このアカウントは無効化されています。',
  'auth/email-already-in-use': 'このメールアドレスは既に登録されています。',
  'auth/weak-password': 'パスワードは6文字以上にしてください。',
  'auth/too-many-requests': '試行回数が多すぎます。しばらくしてからお試しください。',
  'auth/network-request-failed': 'ネットワークエラーが発生しました。',
  'auth/popup-blocked': 'ポップアップがブロックされました。許可してからお試しください。',
};

const IGNORED_ERRORS = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

export default function FirebaseAuthScreen() {
  const [screen, setScreen] = useState<Screen>('signIn');
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  function go(next: Screen) {
    setScreen(next);
    setError('');
    setInfo('');
    setPassword('');
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await action();
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      if (!IGNORED_ERRORS.has(code)) {
        setError(ERROR_MESSAGES[code] ?? '処理に失敗しました。もう一度お試しください。');
      }
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) {
      return;
    }
    const firebaseAuth = auth;
    void run(async () => {
      if (screen === 'signIn') {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else if (screen === 'signUp') {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        if (!credential.user.emailVerified) {
          await sendEmailVerification(credential.user);
        }
      } else {
        await sendPasswordResetEmail(firebaseAuth, email);
        setInfo('パスワード再設定のメールを送信しました。');
      }
    });
  }

  function handleGoogle() {
    if (!auth) {
      return;
    }
    const firebaseAuth = auth;
    void run(async () => {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
    });
  }

  if (!mounted) {
    return <main className="auth-message">読み込み中...</main>;
  }

  if (!auth) {
    return (
      <main className="auth-message" role="alert">
        Firebase の設定が不足しているため、ログイン画面を表示できません。
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-label="妖精バイオームのログイン">
        <header className="auth-heading">
          <p>妖精バイオーム</p>
          <h1>{TITLES[screen]}</h1>
        </header>
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              メールアドレス
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {screen !== 'forgotPassword' && (
              <label>
                パスワード
                <input
                  type="password"
                  autoComplete={screen === 'signUp' ? 'new-password' : 'current-password'}
                  required
                  minLength={screen === 'signUp' ? 6 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            {info && (
              <p className="auth-info" role="status">
                {info}
              </p>
            )}
            <button type="submit" disabled={busy}>
              {screen === 'signIn' ? 'ログイン' : screen === 'signUp' ? '登録する' : '再設定メールを送る'}
            </button>
            {screen !== 'forgotPassword' && (
              <button type="button" className="auth-secondary" disabled={busy} onClick={handleGoogle}>
                Google でログイン
              </button>
            )}
          </form>
          <div className="auth-links">
            {screen === 'signIn' && (
              <>
                <button type="button" onClick={() => go('signUp')}>
                  アカウントをつくる
                </button>
                <button type="button" onClick={() => go('forgotPassword')}>
                  パスワードを忘れた
                </button>
              </>
            )}
            {screen !== 'signIn' && (
              <button type="button" onClick={() => go('signIn')}>
                ログインに戻る
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
