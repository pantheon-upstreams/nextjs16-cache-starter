'use client';

import { useState, useEffect } from 'react';

export default function ServerInfo() {
  const [info, setInfo] = useState<{
    timestamp: string;
    renderTime: string;
  } | null>(null);

  useEffect(() => {
    setInfo({
      timestamp: new Date().toISOString(),
      renderTime: new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    });
  }, []);

  if (!info) {
    return <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-blue-200 dark:border-blue-600">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rendered At (UTC)</div>
          <div className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{info.renderTime}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Timestamp</div>
          <div className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{info.timestamp}</div>
        </div>
      </div>
    </div>
  );
}
