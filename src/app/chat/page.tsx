'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ChatUI from '../../components/ChatUI'; // パスは環境に合わせて調整してください

// クエリパラメータを処理する内側のコンポーネント
function ChatContent() {
  const searchParams = useSearchParams();
  
  // URLが /chat?bot=ai-assistant の場合、"ai-assistant" が取得できる
  const botName = searchParams.get('bot');

  if (!botName) {
    return (
      <div className="p-4 text-center text-red-500">
        ボットが指定されていません。
      </div>
    );
  }

  return <ChatUI botName={decodeURIComponent(botName)} />;
}

// 外部に公開するメインのページコンポーネント
export default function ChatPage() {
  return (
    // 静的エクスポート時にuseSearchParamsを使うための必須設定
    <Suspense fallback={<div className="p-4 text-center">読み込み中...</div>}>
      <ChatContent />
    </Suspense>
  );
}