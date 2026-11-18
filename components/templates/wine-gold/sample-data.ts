export type WineGoldData = {
  couple: {
    first: string
    second: string
    joinWord: string
  }
  eyebrow: string
  date: {
    iso: string
    display: string
    weekday: string
    time: string
  }
  greeting: {
    title: string
    body: string
  }
  venue: {
    eyebrow: string
    headline: string
    name: string
    address: string
    mapsUrl: string
    detailsUrl?: string
    mapEmbedUrl?: string
    image: string
  }
  events: Array<{
    id: string
    time: string
    title: string
    detail?: string
  }>
  countdown: {
    label: string
    targetIso: string
  }
  story: {
    title: string
    body: string
  }
  dressCode: {
    eyebrow: string
    title: string
    body: string
    note: string
    palette: string[]
    floralSide: string
    floralBottom: string
    attire: string
  }
  rsvp: {
    deadline: string
    titleLine1: string
    titleLine2: string
    /** @deprecated prefer titleLine1/titleLine2 — kept for live config mapping */
    title?: string
    body: string
    cta: string
  }
  contact: {
    eyebrow: string
    message: string
    name: string
    role: string
    phone: string
  }
  footer: {
    tagline: string
  }
  images: {
    hero: string
    story: string
    footer: string
  }
}

export const WINE_GOLD_SAMPLE: WineGoldData = {
  couple: {
    first: 'Alexander',
    second: 'Valeria',
    joinWord: 'and',
  },
  eyebrow: 'Wedding Invitation',
  date: {
    iso: '2026-09-12',
    display: '12.09.2026',
    weekday: 'Saturday',
    time: '4:00 PM',
  },
  greeting: {
    title: 'Dear guests!',
    body:
      'We invite you to share our joy and celebrate the beginning of our life together. Your presence will make this day even more meaningful.',
  },
  venue: {
    eyebrow: 'Celebration venue',
    headline: 'Where faith and family gather',
    // Preview reference only — live invites override from project settings
    name: 'Lourdes Syro Malabar Forane Church, Kottayam',
    address: 'Lourdes Syro Malabar Forane Church, Kottayam, Kerala',
    mapsUrl: 'https://maps.app.goo.gl/1UHu2mYn3hEeSNeE8',
    detailsUrl: 'https://maps.app.goo.gl/1UHu2mYn3hEeSNeE8',
    image: '/landing/hero-ceremony.png',
  },
  events: [
    {
      id: 'gathering',
      time: '16:00',
      title: 'Guest gathering',
      detail: 'Welcome buffet and meeting',
    },
    {
      id: 'ceremony',
      time: '17:00',
      title: 'Ceremony',
      detail: 'Solemn registration in the open air',
    },
    {
      id: 'banquet',
      time: '18:00',
      title: 'Banquet',
      detail: 'Festive dinner, toasts, and warm wishes',
    },
    {
      id: 'dance',
      time: '20:00',
      title: 'First dance',
      detail: 'Our special moment',
    },
    {
      id: 'party',
      time: '21:00',
      title: 'Entertainment',
      detail: 'Music, dancing, and surprises',
    },
    {
      id: 'close',
      time: '23:00',
      title: 'Conclusion',
      detail: 'But this is only the beginning of our story…',
    },
  ],
  countdown: {
    label: 'Countdown',
    targetIso: '2026-09-12',
  },
  story: {
    title: 'Our story becomes a family',
    body: 'We believe the most important moments in life become even more beautiful when you are beside us.',
  },
  dressCode: {
    eyebrow: 'Dress code',
    title: 'Add a touch of wine',
    body:
      'We would be glad if you support our color palette in your looks — as a symbol of warmth, love, and a festive atmosphere.',
    note:
      'The main thing is your presence — style simply helps create a special mood for this day.',
    palette: ['#2A1218', '#641D2C', '#A66B72', '#E8D4C4', '#FDF8F0'],
    floralSide: '/landing/templates/wine-gold-dress/wine-gold-floral-side.png',
    floralBottom: '/landing/templates/wine-gold-dress/wine-gold-floral-bottom.png',
    attire: '/landing/templates/wine-gold-dress/wine-gold-dress-code.png',
  },
  rsvp: {
    deadline: 'Until 15 August 2026',
    titleLine1: 'Questionnaire',
    titleLine2: 'for guests',
    title: 'Kindly respond',
    body: 'Please confirm your attendance at our wedding — it means a great deal to us.',
    cta: 'Send response',
  },
  contact: {
    eyebrow: 'For your questions',
    message: 'On the wedding day we will be busy with love',
    name: 'Marina Petrova',
    role: 'Organizer of our celebration',
    phone: '+7 918 456-49-02',
  },
  footer: {
    tagline: 'We create happiness together, until the end',
  },
  images: {
    hero: '/landing/templates/wine-gold-hero.jpg',
    story: '/landing/templates/wine-gold-hero2.jpg',
    footer: '/landing/templates/wine-gold-footer.jpg',
  },
}
