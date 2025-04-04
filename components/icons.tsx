import {
  CaretSortIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"
import {
  ArrowDown,
  BadgePercent,
  Bell,
  Box,
  Calendar,
  Check,
  ChevronLeft,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  CirclePlus,
  CircleUser,
  CircleX,
  Cog,
  Copy,
  CreditCard,
  Dot,
  Download,
  Eye,
  EyeOff,
  File,
  GitBranch,
  Globe,
  Home,
  Info,
  Key,
  Landmark,
  LayoutDashboard,
  LineChart,
  Loader2,
  Lock,
  LogOut,
  LucideProps,
  MapPin,
  Menu,
  MessageSquareMore,
  Minus,
  MoreHorizontal,
  MoreVertical,
  MoveLeftIcon,
  NotebookText,
  Pencil,
  Pizza,
  Plus,
  ScrollText,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  Upload,
  User,
  Users,
  WalletMinimal,
  Wheat,
  WheatOff,
  X,
} from "lucide-react"

export const Icons = {
  store: Store,
  badgePercent: BadgePercent,
  bell: Bell,
  box: Box,
  calendar: Calendar,
  check: Check,
  caretSortIcon: CaretSortIcon,
  chevronLeft: ChevronLeft,
  chevronLeftIcon: ChevronLeftIcon,
  chevronRightIcon: ChevronRightIcon,
  chevronsUpDown: ChevronsUpDown,
  circleAlert: CircleAlert,
  circleCheck: CircleCheck,
  circlePlus: CirclePlus,
  circleUser: CircleUser,
  circleX: CircleX,
  cog: Cog,
  copy: Copy,
  creditCard: CreditCard,
  circleDollarSign: CircleDollarSign,
  dot: Dot,
  doubleArrowLeftIcon: DoubleArrowLeftIcon,
  doubleArrowRightIcon: DoubleArrowRightIcon,
  download: Download,
  arrowDown: ArrowDown,
  eye: Eye,
  eyeOff: EyeOff,
  file: File,
  gitBranch: GitBranch,
  globe: Globe,
  walletMinimal: WalletMinimal,
  google: ({ ...props }: LucideProps) => (
    <svg
      className='mr-2 h-4 w-4'
      aria-hidden='true'
      focusable='false'
      data-prefix='fab'
      data-icon='github'
      role='img'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      {...props}
    >
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
      <path d='M1 1h22v22H1z' fill='none' />
    </svg>
  ),
  home: Home,
  info: Info,
  key: Key,
  landmark: Landmark,
  layoutDashboard: LayoutDashboard,
  lineChart: LineChart,
  lock: Lock,
  logOut: LogOut,
  mapPin: MapPin,
  menu: Menu,
  messageSquareMore: MessageSquareMore,
  minus: Minus,
  moreHorizontal: MoreHorizontal,
  moreVertical: MoreVertical,
  moveLeftIcon: MoveLeftIcon,
  notebookText: NotebookText,
  pencil: Pencil,
  pizza: Pizza,
  plus: Plus,
  scrollText: ScrollText,
  search: Search,
  settings: Settings,
  shield: Shield,
  shoppingCart: ShoppingCart,
  spinner: Loader2,
  trash2: Trash2,
  truck: Truck,
  upload: Upload,
  user: User,
  users: Users,
  whatsapp: ({ ...props }: LucideProps) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      x='0px'
      y='0px'
      width='48'
      height='48'
      viewBox='0 0 48 48'
      {...props}
    >
      <path
        fill='#fff'
        d='M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z'
      ></path>
      <path
        fill='#fff'
        d='M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z'
      ></path>
      <path
        fill='#cfd8dc'
        d='M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z'
      ></path>
      <path
        fill='#40c351'
        d='M35.176,12.842c-2.967-2.965-6.914-4.598-11.147-4.6c-8.695-0.004-15.778,7.074-15.785,15.766c-0.002,3.04,0.857,6.004,2.475,8.571l0.391,0.627l-1.588,5.801l5.857-1.561l0.599,0.355c2.43,1.439,5.208,2.207,8.052,2.208h0.007c8.691,0,15.771-7.083,15.775-15.774C39.773,19.757,38.14,15.81,35.176,12.842z'
      ></path>
      <path
        fill='#fff'
        d='M20.958,14.195c-0.271-0.604-0.554-0.615-0.812-0.627c-0.212-0.009-0.453-0.008-0.694-0.008s-0.637,0.091-0.971,0.456c-0.334,0.365-1.275,1.245-1.275,3.038s1.306,3.518,1.487,3.759s2.521,4.029,6.22,5.479c3.073,1.214,3.693,0.971,4.353,0.909s2.141-0.873,2.444-1.716s0.303-1.561,0.212-1.716s-0.334-0.243-0.694-0.426s-2.141-1.058-2.472-1.177c-0.331-0.119-0.572-0.182-0.813,0.183s-0.931,1.177-1.141,1.421s-0.424,0.273-0.784,0.091s-1.523-0.561-2.898-1.785c-1.071-0.953-1.796-2.136-2.006-2.494s-0.023-0.554,0.166-0.736c0.17-0.165,0.376-0.426,0.565-0.639c0.188-0.213,0.251-0.364,0.376-0.608s0.063-0.456-0.03-0.639S21.228,14.798,20.958,14.195z'
      ></path>
    </svg>
  ),
  wheat: Wheat,
  wheatOff: WheatOff,
  x: X,
}

export type Icon = keyof typeof Icons
