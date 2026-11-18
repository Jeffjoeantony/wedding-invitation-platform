export type ClassicRomanceData = {
  couple: {
    first: string
    second: string
    joinWord: string
  }
  date: {
    day: string
    month: string
    year: string
    display: string
  }
  venue: {
    script: string
    eyebrow: string
    name: string
    address: string
    mapsUrl: string
    mapsLabel: string
  }
  schedule: Array<{
    id: string
    time: string
    title: string
    detail: string
    icon: 'gathering' | 'ceremony' | 'banquet' | 'dance' | 'entertainment' | 'conclusion'
  }>
  welcome: string
  dressCode: {
    eyebrow: string
    title: string
    colorsTitle: string
    body: string
    palette: string[]
    gallery: string[]
  }
  details: {
    script: string
    title: string
    giftsTitle: string
    giftsBody: string
    flowersTitle: string
    flowersBody: string
    contactsTitle: string
    contactsBody: string
    telegramLabel: string
    telegramUrl: string
  }
  rsvp: {
    title: string
    body: string
    cta: string
    deadline: string
  }
  footer: {
    line: string
  }
  images: {
    hero: string
    floralCorner: string
    floralDivider: string
    floralBand: string
    dressGrid: string
    peonyCluster: string
    floralCornerWide: string
  }
}

export const CLASSIC_ROMANCE_SAMPLE: ClassicRomanceData = {
  couple: {
    first: 'Kashi',
    second: 'Anfisa',
    joinWord: '&',
  },
  date: {
    day: '21',
    month: 'September',
    year: '2027',
    display: '21.09.2027',
  },
  venue: {
    script: 'Location',
    eyebrow: 'Celebration venue',
    name: 'St. John The Baptist Forane Church, Nedumkunnam',
    address: 'Karukachal Manimala Rd, Nedumkunnam, Keralam 686542image.png',
    mapsUrl: 'https://maps.app.goo.gl/1gwktEXonLUvYBq17',
    mapsLabel: 'Open map',
  },
  schedule: [
    {
      id: 'gathering',
      time: '16:00',
      title: 'Guest gathering',
      detail: 'Welcome buffet and meeting',
      icon: 'gathering',
    },
    {
      id: 'ceremony',
      time: '17:00',
      title: 'Ceremony',
      detail: 'Solemn registration in the open air',
      icon: 'ceremony',
    },
    {
      id: 'banquet',
      time: '18:00',
      title: 'Banquet',
      detail: 'Festive dinner, toasts, and warm wishes',
      icon: 'banquet',
    },
    {
      id: 'dance',
      time: '20:00',
      title: 'First dance',
      detail: 'Our special moment',
      icon: 'dance',
    },
    {
      id: 'entertainment',
      time: '21:00',
      title: 'Entertainment',
      detail: 'Music, dancing, and surprises',
      icon: 'entertainment',
    },
    {
      id: 'conclusion',
      time: '23:00',
      title: 'Conclusion',
      detail: 'But this is only the beginning of our story...',
      icon: 'conclusion',
    },
  ],
  welcome: 'We will be happy to share this day with you!',
  dressCode: {
    eyebrow: 'Dress code',
    title: 'Dress code',
    colorsTitle: 'Colors of our day',
    body:
      'We would love it if your looks support our palette — as a symbol of warmth, love, and celebration.',
    palette: ['#3D0A10', '#5C1018', '#8B3A45', '#C4A882', '#F6EFE4'],
    gallery: [
      '/landing/templates/classic-romance/dress-grid.jpg',
      '/invitations/bride-portrait.png',
      '/invitations/couple-portrait.png',
      '/invitations/groom-portrait.png',
    ],
  },
  details: {
    script: 'Details',
    title: 'Celebration details',
    giftsTitle: 'Gifts',
    giftsBody:
      'We look forward to welcoming you to an unforgettable celebration filled with love, laughter and cherished moments. Your presence will make this occasion truly special',
    flowersTitle: 'The Evening',
    flowersBody:
      'Join us as we celebrate the beginning of a beautiful journey together, surrounded by family, friends and the people who mean the most to us.',
    contactsTitle: 'Contacts',
    contactsBody: 'For any questions or assistance regarding the celebration, please feel free to contact our event coordinator, Victoria.',
    telegramLabel: 'CONTACT',
    telegramUrl: 'https://t.me/',
  },
  rsvp: {
    title: 'Guest questionnaire',
    body: 'Please answer a few questions by 15.08.2027 so we can prepare for you.',
    cta: 'Fill out',
    deadline: 'Until 15 August 2027',
  },
  footer: {
    line: 'Waiting for you, with love',
  },
  images: {
    hero: '/landing/templates/classic-romance/classic-romance-hero.jpg',
    floralCorner: '/landing/templates/classic-romance/floral-corner.png',
    floralDivider: '/landing/templates/classic-romance/floral-divider.png',
    floralBand: '/landing/templates/classic-romance/floral-band.png',
    dressGrid: '/landing/templates/classic-romance/dress-code.png',
    peonyCluster: '/landing/templates/classic-romance/imgbin_9347653bd2f98db8e07ed8506611b05a (1).png',
    floralCornerWide:
      '/landing/templates/classic-romance/Wide Burgundy Floral Corner Arrangement.png',
  },
}
