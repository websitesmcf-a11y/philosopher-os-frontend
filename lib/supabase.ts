import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
