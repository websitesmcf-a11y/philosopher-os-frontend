import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(url, key);

export type Lead = {
  id: string;
  name: string;
  phone: string;
  industry: string;
  status: 'pending' | 'sent' | 'replied' | 'closed' | 'not_on_wa';
  sent_at: string | null;
  replied_at: string | null;
  last_message: string | null;
  last_message_at: string | null;
  session: string;
  created_at: string;
};

export type Message = {
  id: string;
  lead_phone: string;
  direction: 'in' | 'out';
  body: string;
  session: string;
  created_at: string;
};

export type PendingReply = {
  id: string;
  lead_phone: string;
  message: string;
  created_at: string;
};
