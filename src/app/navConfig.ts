import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTimeOutlined';
import EventNoteIcon from '@mui/icons-material/EventNoteOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import WorkIcon from '@mui/icons-material/WorkOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import DevicesIcon from '@mui/icons-material/DevicesOutlined';
import SupportIcon from '@mui/icons-material/SupportAgentOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import ShieldIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavItem {
  label: string;
  to: string;
  icon: SvgIconComponent;
  /** If set, only shown when the user has at least one of these roles. */
  roles?: string[];
  /** Module not yet implemented — routes to a "coming soon" placeholder. */
  upcoming?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: DashboardIcon },
  { label: 'Employees', to: '/employees', icon: PeopleIcon },
  { label: 'Attendance', to: '/attendance', icon: AccessTimeIcon },
  { label: 'Leave', to: '/leave', icon: EventNoteIcon },
  { label: 'Payroll', to: '/payroll', icon: PaymentsIcon, roles: ['COMPANY_ADMIN', 'PAYROLL_MANAGER', 'FINANCE_MANAGER'] },
  { label: 'Recruitment', to: '/recruitment', icon: WorkIcon, roles: ['COMPANY_ADMIN', 'HR_MANAGER', 'RECRUITER'] },
  { label: 'Performance', to: '/performance', icon: TrendingUpIcon },
  { label: 'Expenses', to: '/expense', icon: ReceiptIcon },
  { label: 'Assets', to: '/assets', icon: DevicesIcon },
  { label: 'Helpdesk', to: '/helpdesk', icon: SupportIcon },
  { label: 'Billing', to: '/billing', icon: CreditCardIcon, roles: ['COMPANY_ADMIN', 'FINANCE_MANAGER'] },
  { label: 'Platform', to: '/platform', icon: ShieldIcon, roles: ['SUPER_ADMIN'] },
];

export function visibleNav(roles: string[]): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.some((r) => roles.includes(r)));
}
