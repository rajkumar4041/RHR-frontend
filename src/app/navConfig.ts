import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTimeOutlined';
import EventNoteIcon from '@mui/icons-material/EventNoteOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
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
  { label: 'Attendance', to: '/attendance', icon: AccessTimeIcon, upcoming: true },
  { label: 'Leave', to: '/leave', icon: EventNoteIcon },
  { label: 'Payroll', to: '/payroll', icon: PaymentsIcon, roles: ['COMPANY_ADMIN', 'PAYROLL_MANAGER'], upcoming: true },
  { label: 'Settings', to: '/settings', icon: SettingsIcon, roles: ['COMPANY_ADMIN'], upcoming: true },
];

export function visibleNav(roles: string[]): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.some((r) => roles.includes(r)));
}
