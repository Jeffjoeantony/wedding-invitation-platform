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
    icon: 'cake' | 'sparkles' | 'rings' | 'music'
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
  }
}

export const CLASSIC_ROMANCE_SAMPLE: ClassicRomanceData = {
  couple: {
    first: 'Ilya',
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
    name: 'Restaurant Aurora',
    address: 'Moscow, Solnechnaya St, 115',
    mapsUrl: 'https://maps.google.com/?q=Moscow',
    mapsLabel: 'Open map',
  },
  schedule: [
    { id: 'cake', time: '20:00', title: 'Wedding cake', icon: 'cake' },
    { id: 'close', time: '23:00', title: 'End of the evening', icon: 'sparkles' },
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
      'Your presence is the greatest gift. If you wish to honor us further, a contribution to our new home is warmly appreciated.',
    flowersTitle: 'Flowers',
    flowersBody:
      'Please do not bring flowers — we will have plenty. Your warm wishes mean more than bouquets.',
    contactsTitle: 'Contacts',
    contactsBody: 'Questions for our organizer Victoria — write anytime.',
    telegramLabel: 'Telegram',
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
    hero: '/landing/templates/classic-romance/hero-couple.png',
    floralCorner: '/landing/templates/classic-romance/floral-corner.png',
    floralDivider: '/landing/templates/classic-romance/floral-divider.png',
    floralBand: '/landing/templates/classic-romance/floral-band.png',
    dressGrid: '/landing/templates/classic-romance/dress-grid.jpg',
  },
}
