'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, Check, Bot, Layers, Target,
  Calendar, Zap, Swords, Smartphone, Users, Shield,
} from 'lucide-react';

const STEPS = [
  {
    title: 'Welcome to Philosopher OS',
    icon: Bot,
    color: '#123C69',
    badge: 'Step 1 of 8',
    content: `You've just joined an AI-powered agency operating system.

Twenty AI agents are ready to help you manage leads, run campaigns, track tasks, and automate your workflow.

This quick tour shows you the essentials.`,
  },
  {
    title: 'The AI Council',
    icon: Bot,
    color: '#8B2020',
    badge: 'Step 2 of 8 — Intelligence',
    content: `Philosophers (Strategy & Planning):
• Plato (CEO), Socrates (Strategy), Aristotle (Memory)
• Leonidas (Ops), Athena (Assistant), Heraclitus (Research)
• Pythagoras (Analytics), Solon (Finance)
• Archimedes (Engineering), Odysseus (Outreach)

Gods & Titans (Execution):
• Iapetus, Astraeus, Erebos, Phantasos, Stilbon

Each has a specialty. Chat with them from the Philosophers page.`,
  },
  {
    title: 'Your Profile & Settings',
    icon: Shield,
    color: '#2563EB',
    badge: 'Step 3 of 8 — Your Account',
    content: `Start by setting up your profile:
• Pick a philosopher portrait as your avatar
• Set your timezone
• Connect WhatsApp for notifications and 2FA

Then configure notifications for desktop, WhatsApp, and email.`,
  },
  {
    title: 'Leads & Lead Lists',
    icon: Layers,
    color: '#6F7D4F',
    badge: 'Step 4 of 8 — CRM',
    content: `Leads are your prospects. You can add them manually or import them.

LEAD LISTS let you organize leads into named pools.

When a list is attached to a campaign and launched, those leads are LOCKED — they disappear from the general lead pool so no one else messages them.

Your leads = yours. Other team members can't touch them.`,
  },
  {
    title: 'Campaigns & Conversations',
    icon: Target,
    color: '#C9A24D',
    badge: 'Step 5 of 8 — Outreach',
    content: `Campaigns send messages to your lead lists:

1. Create a Lead List with your target leads
2. Create a Campaign → select your list
3. Launch — messages go out to every lead

The Conversations page shows all threads across every channel, labeled with which agent chatted with that person.

The Auto Reply Bot handles incoming replies intelligently.`,
  },
  {
    title: 'Tasks & Schedule',
    icon: Calendar,
    color: '#3b82f6',
    badge: 'Step 6 of 8 — Operations',
    content: `Tasks track work items. Create tasks with:
• Title, priority, and description
• Assignment to an AI agent or yourself
• Schedule with 24-hour time (e.g. 19:20 = 7:20 PM)

The Schedule page shows your tasks grouped by day. Connect Google Calendar to see external events alongside your tasks.

Local calendar shows only your own tasks.`,
  },
  {
    title: 'Beast Mode + Auto Reply',
    icon: Zap,
    color: '#DC2626',
    badge: 'Step 7 of 8 — Automation',
    content: `Beast Mode orchestrates multiple agents for autonomous missions.

Type a goal → the system auto-selects the best agents → launch.

4 danger levels: Dry Run (safe) → Assisted → Approved → Full Beast Mode.

⚠️ Start with Level 1 (Dry Run). Level 4 sends real messages.

The Auto Reply Bot handles incoming WhatsApp and email replies using a context document you upload (500+ words minimum).`,
  },
  {
    title: 'Multi-User & Notifications',
    icon: Users,
    color: '#22c55e',
    badge: 'Step 8 of 8 — Team',
    content: `Working with a team? Here's how it's organized:

• Your leads are YOURS — assigned to you, visible only to you
• Admins see everything and can reassign
• Lead Lists lock leads — no double-messaging
• Every action is audited

Notifications: Desktop popups, WhatsApp alerts, or email.
Enable 2FA in Security settings for extra protection.

Go build something unstoppable.`,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('philosopher_onboarding_complete', 'true');
      localStorage.setItem('tutorial_done', '1');  // Prevent the overlay tutorial from also firing
      // Redirect to profile setup so they choose their avatar and name
      router.push('/settings/profile');
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('philosopher_onboarding_complete', 'true');
    localStorage.setItem('tutorial_done', '1');  // Prevent the overlay tutorial from also firing
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0F1722',
      padding: 20,
    }}>
      <div style={{
        maxWidth: 560, width: '100%',
        background: '#1a2332',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%',
            width: `${((step + 1) / STEPS.length) * 100}%`,
            background: `linear-gradient(90deg, #C9A24D, ${current.color})`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 24px', justifyContent: 'center' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i === step ? current.color : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 24px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block', marginBottom: 12,
            padding: '3px 10px', borderRadius: 12,
            background: `${current.color}15`,
            color: current.color, fontSize: 11, fontWeight: 600,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
          }}>
            {current.badge}
          </div>

          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${current.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Icon size={24} color={current.color} />
          </div>

          <h1 style={{
            fontSize: 22, fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-heading)',
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}>
            {current.title}
          </h1>

          <div style={{
            fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)',
            whiteSpace: 'pre-wrap',
            marginBottom: 24,
          }}>
            {current.content}
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 20,
          }}>
            <button onClick={() => setStep(s => s - 1)} disabled={isFirst}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', background: 'none',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                cursor: isFirst ? 'default' : 'pointer',
                color: isFirst ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                fontSize: 13, opacity: isFirst ? 0.3 : 1,
              }}>
              <ChevronLeft size={14} /> Back
            </button>

            <button onClick={handleSkip}
              style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12,
              }}>
              Skip
            </button>

            <button onClick={handleNext}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', background: current.color,
                border: 'none', borderRadius: 6, cursor: 'pointer',
                color: '#fff', fontSize: 13, fontWeight: 600,
              }}>
              {isLast ? <><Check size={14} /> Done</> : <>Next <ChevronRight size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
