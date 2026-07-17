export interface DashboardTheme {
  pageBg: string
  loadingSpinner: string
  headerBorder: string
  navBtnHover: string
  iconGradient: string
  tabsListBorder: string
  tabActive: string
  /** Frosted glass surface for cards / panels */
  glassCard: string
  heroClassName: string
  heroStyle?: { background?: string }
  heroMutedText: string
  attendeesAccent: string
  attendeesText: string
  attendeesIconBg: string
  searchFocus: string
  filterActive: string
  filterActiveBadge: string
  tableRowHover: string
  copyLinkBtn: string
  primaryBtn: string
  importDropzone: string
}

const glassCard =
  'bg-white/55 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_rgba(31,41,55,0.08)] rounded-2xl'

const defaultTheme: DashboardTheme = {
  pageBg:
    'min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/80 via-amber-50/40 to-rose-50',
  loadingSpinner: 'border-rose-200 border-t-rose-600',
  headerBorder: 'border-white/50',
  navBtnHover: 'hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700',
  iconGradient: 'bg-gradient-to-br from-rose-600 to-rose-800',
  tabsListBorder: 'border-white/60',
  tabActive:
    'data-[state=active]:bg-rose-700/95 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:backdrop-blur-sm',
  glassCard,
  heroClassName:
    'relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-700/95 via-rose-800/95 to-rose-900/95 text-white shadow-xl p-6 backdrop-blur-xl border border-white/10',
  heroMutedText: 'text-rose-300',
  attendeesAccent: 'border-rose-400',
  attendeesText: 'text-rose-700',
  attendeesIconBg: 'bg-rose-50/80',
  searchFocus: 'focus:border-rose-300',
  filterActive: 'bg-rose-700 text-white shadow-sm',
  filterActiveBadge: 'bg-rose-600 text-white',
  tableRowHover: 'hover:bg-rose-50/40',
  copyLinkBtn: 'border-rose-200 text-rose-700 hover:bg-rose-50',
  primaryBtn: 'bg-rose-700 hover:bg-rose-800 text-white',
  importDropzone: 'border-rose-200 hover:bg-rose-50/40',
}

const birthdayTheme: DashboardTheme = {
  pageBg:
    'min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/90 via-purple-50/50 to-indigo-50',
  loadingSpinner: 'border-violet-200 border-t-violet-600',
  headerBorder: 'border-white/50',
  navBtnHover: 'hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700',
  iconGradient: 'bg-gradient-to-br from-violet-600 via-purple-700 to-purple-900',
  tabsListBorder: 'border-white/60',
  tabActive:
    'data-[state=active]:bg-violet-700/95 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:backdrop-blur-sm',
  glassCard,
  heroClassName:
    'relative overflow-hidden rounded-2xl text-white shadow-xl p-6 backdrop-blur-xl border border-white/10',
  heroStyle: {
    background: 'linear-gradient(160deg, rgba(61,26,110,0.95) 0%, rgba(45,16,96,0.95) 35%, rgba(30,9,56,0.95) 65%, rgba(15,5,32,0.95) 100%)',
  },
  heroMutedText: 'text-purple-300',
  attendeesAccent: 'border-amber-400',
  attendeesText: 'text-violet-700',
  attendeesIconBg: 'bg-violet-50/80',
  searchFocus: 'focus:border-violet-300',
  filterActive: 'bg-violet-700 text-white shadow-sm',
  filterActiveBadge: 'bg-violet-600 text-white',
  tableRowHover: 'hover:bg-violet-50/40',
  copyLinkBtn: 'border-violet-200 text-violet-700 hover:bg-violet-50',
  primaryBtn: 'bg-violet-700 hover:bg-violet-800 text-white',
  importDropzone: 'border-violet-200 hover:bg-violet-50/40',
}

export function getDashboardTheme(eventTemplate?: string | null): DashboardTheme {
  if (eventTemplate === 'Birthday') return birthdayTheme
  return defaultTheme
}
