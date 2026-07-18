/** Invite-adjacent palette — close to invitation LUXURY, slightly softer for marketing. */
export const LANDING = {
  ivory: '#FAF8F3',
  beige: '#F3EEE6',
  champagne: '#E6DDD0',
  gold: '#C4A46A',
  goldDark: '#9E8348',
  goldSoft: '#E8D5B0',
  ink: '#1C1916',
  charcoal: '#2F2B27',
  muted: '#6E6862',
  card: '#FFFcf8',
} as const

/** Royalty-free Unsplash samples (not from /public/invitations). */
export const SAMPLE_IMAGES = {
  wedding:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  engagement:
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
  reception:
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
  birthday:
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80',
  floral:
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
  table:
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
} as const

export const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Templates' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
] as const

export const FEATURES = [
  {
    title: 'Unlimited Invitations',
    description: 'Create as many celebrations as you need — weddings, birthdays, and more.',
    icon: 'Sparkles',
  },
  {
    title: 'RSVP Management',
    description: 'Collect responses in real time and know who is joining your day.',
    icon: 'CheckCircle2',
  },
  {
    title: 'Guest Lists',
    description: 'Import guests, personalize messages, and keep everything organized.',
    icon: 'Users',
  },
  {
    title: 'WhatsApp Sharing',
    description: 'Share elegant invite links instantly with the people who matter.',
    icon: 'MessageCircle',
  },
  {
    title: 'Photo Gallery',
    description: 'Showcase cherished moments with a calm, cinematic gallery.',
    icon: 'Images',
  },
  {
    title: 'QR Invitations',
    description: 'Print-ready QR codes for cards, seating, and easy mobile access.',
    icon: 'QrCode',
  },
] as const

export const HOW_IT_WORKS = [
  { step: '01', title: 'Create Project', description: 'Start a new celebration and set the essentials in moments.' },
  { step: '02', title: 'Customize', description: 'Add events, photos, and the details that matter most.' },
  { step: '03', title: 'Share Instantly', description: 'Send via link, WhatsApp, or QR — beautifully and fast.' },
  { step: '04', title: 'Track RSVPs', description: 'Watch responses arrive and manage your day with clarity.' },
] as const

export const TEMPLATES = [
  { category: 'Wedding', image: SAMPLE_IMAGES.wedding, title: 'Eternal Vows' },
  { category: 'Engagement', image: SAMPLE_IMAGES.engagement, title: 'Promise Evening' },
  { category: 'Reception', image: SAMPLE_IMAGES.reception, title: 'Golden Reception' },
  { category: 'Birthday', image: SAMPLE_IMAGES.birthday, title: 'Celebratory Hour' },
  { category: 'Anniversary', image: SAMPLE_IMAGES.floral, title: 'Years of Love' },
  { category: 'Celebration', image: SAMPLE_IMAGES.table, title: 'Gathering Night' },
] as const

export const FAQ_ITEMS = [
  {
    q: 'Is Goldleaf free to start?',
    a: 'Yes. You can create invitations, manage guests, and share links without friction. Premium options unlock advanced presentation features when you need them.',
  },
  {
    q: 'Can I personalize each guest’s invitation?',
    a: 'Absolutely. Address guests by name, tailor messages, and share unique links so every invitation feels intentional.',
  },
  {
    q: 'Do guests need an app to RSVP?',
    a: 'No. Guests open a beautiful web invitation on any phone or desktop and respond in a few taps — no downloads required.',
  },
  {
    q: 'How do I share invitations?',
    a: 'Share via WhatsApp, email, or a printable QR code. One elegant link is all your guests need.',
  },
] as const

export const CREATE_HREF = '/admin/login'
export const SIGN_IN_HREF = '/admin/login'
