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
  { href: '/#home', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/#templates', label: 'Templates' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#faq', label: 'FAQ' },
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
  { step: '01', title: 'Choose a template', description: 'Browse the collection and open the design that feels like your celebration.' },
  { step: '02', title: 'Preview it', description: 'See the live invitation, then add it to your cart when it is the one.' },
  { step: '03', title: 'Checkout', description: 'Confirm your details. We prepare your invitation and your dashboard.' },
  { step: '04', title: 'Use your links', description: 'Your email includes the invitation link to share and the dashboard link to manage it.' },
] as const

/** Dark step cards under “How an invitation website works”. */
export const LIVE_IN_MINUTES = [
  {
    step: '01',
    title: 'Choose a template',
    description: 'Open a design from the collection. Each one has its own product page.',
    icon: 'Palette',
    accent: 'gold',
  },
  {
    step: '02',
    title: 'Preview, then add to cart',
    description: 'Walk through the live invitation. When it feels right, add it to your cart.',
    icon: 'Eye',
    accent: 'sage',
  },
  {
    step: '03',
    title: 'Checkout & open your links',
    description: 'After checkout, your email brings the invitation link and your dashboard link.',
    icon: 'Mail',
    accent: 'champagne',
  },
] as const

export const WEBSITE_INCLUDES = [
  { title: 'Instant WhatsApp sharing', icon: 'MessageCircle' },
  { title: 'Automated RSVP tracking', icon: 'Mail' },
  { title: 'All event details', icon: 'CalendarClock' },
  { title: 'Photo gallery', icon: 'Images' },
  { title: 'Map and directions', icon: 'MapPin' },
  { title: 'Edit while live', icon: 'Pencil' },
] as const

export const TEMPLATES = [
  { category: 'Wedding', image: SAMPLE_IMAGES.wedding, title: 'Eternal Vows' },
  { category: 'Engagement', image: SAMPLE_IMAGES.engagement, title: 'Promise Evening' },
  { category: 'Reception', image: SAMPLE_IMAGES.reception, title: 'Golden Reception' },
  { category: 'Birthday', image: SAMPLE_IMAGES.birthday, title: 'Celebratory Hour' },
  { category: 'Anniversary', image: SAMPLE_IMAGES.floral, title: 'Years of Love' },
  { category: 'Celebration', image: SAMPLE_IMAGES.table, title: 'Gathering Night' },
] as const

/** Editorial gallery — 7 local wedding stills. */
export const GALLERY_CAROUSEL = [
  {
    alt: 'Bridal portrait',
    image: '/invitations/bride-portrait.png',
  },
  {
    alt: 'Couple seated together',
    image: '/invitations/couple-sitting.png',
  },
  {
    alt: 'Wedding ceremony under a floral canopy',
    image: '/landing/hero-ceremony.png',
  },
  {
    alt: 'Bride and groom standing together',
    image: '/invitations/couple-standing.png',
  },
  {
    alt: 'Couple portrait with a bouquet',
    image: '/invitations/couple-portrait.png',
  },
  {
    alt: 'Groom holding a bouquet',
    image: '/invitations/groom-portrait.png',
  },
  {
    alt: 'Wedding rings and flowers',
    image: '/wedding-hero.jpg',
  },
] as const

/** Featured grid right under the hero — Aloha-style product cards. */
export const POPULAR_WEBSITES = [
  {
    slug: 'lavender-garden',
    title: 'Lavender Garden',
    price: 'Free',
    image: '/landing/templates/lavender-garden.jpg',
  },
  {
    slug: 'nikah-arch',
    title: 'Nikah Arch',
    price: '₹599',
    image: '/landing/templates/nikah-arch.jpg',
  },
  {
    slug: 'wine-gold',
    title: 'Wine Gold',
    price: '₹999',
    image: '/landing/templates/wine-gold.jpg',
  },
  {
    slug: 'royal-heritage',
    title: 'Royal Heritage',
    price: '₹849',
    image: '/landing/templates/royal-heritage.jpg',
  },
  {
    slug: 'eternal-vows',
    title: 'Eternal Vows',
    price: '₹699',
    image: '/invitations/couple-standing.png',
  },
  {
    slug: 'promise-evening',
    title: 'Promise Evening',
    price: '₹549',
    image: '/invitations/couple-sitting.png',
  },
  {
    slug: 'golden-portrait',
    title: 'Golden Portrait',
    price: '₹799',
    image: '/invitations/couple-portrait.png',
  },
  {
    slug: 'bridal-bloom',
    title: 'Bridal Bloom',
    price: '₹649',
    image: '/invitations/bride-portrait.png',
  },
] as const

export const POPULAR_WEBSITES_PAGE_SIZE = 4


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

/** Full-bleed “real-time dashboard” features section. */
export const DASHBOARD_SECTION = {
  background: '/landing/dashboard-bg.png',
  preview: '/landing/dashboard-preview.png',
  eyebrow: 'Together Forever',
  title: 'Your real-time dashboard',
  body: 'Every RSVP appears instantly, so the headcount for the caterer is always current. No manual updates, no last-minute confusion.',
  footnote: 'Sample Data',
} as const

/** Full-bleed hero — Indian wedding ceremony (golden hour). */
export const HERO_IMAGE = '/landing/hero-ceremony.png'

export const CREATE_HREF = '/admin/login'
export const SIGN_IN_HREF = '/admin/login'
