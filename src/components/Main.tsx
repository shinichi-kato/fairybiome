/*
アプリメインページ
------------------

AuthProviderで認証後、以下のメニューを表示
* ユーザプロファイルの編集
* チャットボットの指定→UIへの遷移
* サインアウト(firebaseのサインアウト)

*/
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { loadStaticFiles } from '../lib/staticFiles';

export default function Main() {
  const { profile, signOut } = useAuth();
  const [botNames, setBotNames] = useState<string[]>([]);
  const [selectedBot, setSelectedBot] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let disposed = false;
    void loadStaticFiles().then(manifest => {
      if (disposed) {
        return;
      }

      const names = Object.keys(manifest.bots).sort();
      setBotNames(names);
      setSelectedBot(current => current && names.includes(current) ? current : names[0] ?? '');
    });

    return () => {
      disposed = true;
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="w-full min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-bold text-primary">
          {profile?.displayName ? `ようこそ、${profile.displayName}さん` : 'メインメニュー'}
        </h1>

        <Link
          href="/profile"
          className="block w-full rounded-lg border border-gray-300 py-2 hover:bg-gray-50"
        >
          プロフィールを編集
        </Link>

        <div className="space-y-2 text-left">
          <label htmlFor="bot-select" className="block text-sm text-gray-600">
            チャットボットを選択
          </label>
          <select
            id="bot-select"
            value={selectedBot}
            onChange={event => setSelectedBot(event.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2"
            disabled={botNames.length === 0}
          >
            {botNames.length === 0 && <option value="">利用可能なボットがありません</option>}
            {botNames.map(botName => (
              <option key={botName} value={botName}>
                {botName}
              </option>
            ))}
          </select>
          <Link
            href={selectedBot ? `/chat/${encodeURIComponent(selectedBot)}` : '#'}
            aria-disabled={!selectedBot}
            className={`block w-full rounded-lg py-2 text-center text-white ${
              selectedBot ? 'bg-primary hover:opacity-90' : 'pointer-events-none bg-gray-300'
            }`}
          >
            チャットを開始
          </Link>
        </div>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className="w-full rounded-lg border border-gray-300 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          サインアウト
        </button>
      </div>
    </main>
  );
}

