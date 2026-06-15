'use client';

import { useSearchParams } from 'next/navigation';
import AgentChat from '@/components/agent-chat';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const agent = searchParams.get('agent') || 'plato';
  return <AgentChat initialAgent={agent} />;
}
