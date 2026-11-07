import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Keyboard,
  Lock,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Rows3,
  Search,
  Sun,
} from 'lucide-react';
import { useAuth } from '../providers/auth-context';
import { useOrgContext } from '../../features/organizations/queries/use-org-context';
import { useToast } from '../../shared/components/toast-context';
import { Dropdown, type DropdownItem } from '../../shared/components/Dropdown';
import { Avatar } from '../../shared/components/Avatar';
import { usePrefs } from '../../shared/prefs/prefs';
import { PRODUCT_META, crumbsFor, type ProductCode } from './nav';
import { NotificationBell } from './NotificationBell';

const ALL_PRODUCTS: ProductCode[] = ['WYMASSIST', 'WYMINSIGHT', 'WYMFLOW'];

function ProductSwitcher() {
  const org = useOrgContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const toast = useToast();

  const activeCodes = new Set(
    org.status === 'ready' ? org.products.filter((p) => p.active).map((p) => p.code) : []
  );
  const current =
    ALL_PRODUCTS.find((code) => pathname.startsWith(`/dashboard/${code === 'WYMASSIST' ? 'assist' : code === 'WYMINSIGHT' ? 'insight' : 'flow'}`)) ??
    null;
  const Current = current ? PRODUCT_META[current] : null;

  const items: DropdownItem[] = [
    { type: 'label', label: 'Products' },
    ...ALL_PRODUCTS.map((code): DropdownItem => {
      const meta = PRODUCT_META[code];
      const enabled = activeCodes.has(code);
      return {
        type: 'item',
        label: meta.name,
        icon: enabled ? <meta.icon size={15} /> : <Lock size={15} />,
        disabled: !enabled,
        onSelect: () => {
          if (enabled) navigate(meta.home);
          else toast({ title: `${meta.name} isn't enabled`, description: 'Contact WymNet to request access.', kind: 'info' });
        },
      };
    }),
    { type: 'separator' },
    { type: 'label', label: 'Locked products can be enabled by WymNet' },
  ];

  return (
    <Dropdown
      align="start"
      trigger={
        <button className="topbar-switch" aria-label="Switch product">
          {Current ? <Current.icon size={15} /> : <Menu size={15} />}
          <span className="topbar-switch__name">{Current?.name ?? 'WymNet'}</span>
          <ChevronDown size={13} className="topbar-switch__chev" />
        </button>
      }
      items={items}
    />
  );
}

function ThemePicker() {
  const [prefs, setPref] = usePrefs();
  return (
    <div className="usermenu-block">
      <div className="usermenu-label">Theme</div>
      <div className="usermenu-seg" role="radiogroup" aria-label="Theme">
        {(
          [
            ['light', 'Light', Sun],
            ['dark', 'Dark', Moon],
            ['system', 'System', Monitor],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            role="radio"
            aria-checked={prefs.theme === value}
            className={`usermenu-seg__btn${prefs.theme === value ? ' is-active' : ''}`}
            onClick={() => setPref('theme', value)}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserMenu({ onShortcuts }: { onShortcuts: () => void }) {
  const { user, signOut } = useAuth();
  const [prefs, setPref] = usePrefs();
  if (!user) return null;
  return (
    <Dropdown
      align="end"
      width={264}
      trigger={
        <button className="topbar-user" aria-label="Account menu">
          <Avatar name={user.name} size={26} platform={user.platformAccess} />
        </button>
      }
      items={[
        {
          type: 'custom',
          node: (
            <div className="usermenu-head">
              <Avatar name={user.name} size={38} platform={user.platformAccess} />
              <div className="usermenu-head__meta">
                <div className="usermenu-head__name">{user.name}</div>
                <div className="usermenu-head__email">{user.email}</div>
              </div>
            </div>
          ),
        },
        { type: 'custom', node: <ThemePicker /> },
        { type: 'separator' },
        {
          type: 'item',
          label: prefs.density === 'compact' ? 'Comfortable density' : 'Compact density',
          icon: <Rows3 size={15} />,
          onSelect: () => setPref('density', prefs.density === 'compact' ? 'comfortable' : 'compact'),
        },
        {
          type: 'item',
          label: 'Keyboard shortcuts',
          icon: <Keyboard size={15} />,
          shortcut: '?',
          onSelect: onShortcuts,
        },
        { type: 'separator' },
        {
          type: 'item',
          label: 'Sign out',
          icon: <LogOut size={15} />,
          danger: true,
          onSelect: () => void signOut(),
        },
      ]}
    />
  );
}

export function Topbar({
  onMenu,
  onPalette,
  onShortcuts,
}: {
  onMenu: () => void;
  onPalette: () => void;
  onShortcuts: () => void;
}) {
  const { pathname } = useLocation();
  const crumbs = crumbsFor(pathname);
  return (
    <header className="topbar">
      <button className="topbar-menu" aria-label="Open menu" onClick={onMenu}>
        <Menu size={17} />
      </button>
      <ProductSwitcher />
      <nav className="topbar-crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={i} className="topbar-crumb">
            {i > 0 && <span className="topbar-crumb__sep" aria-hidden>/</span>}
            {c.to && i < crumbs.length - 1 ? <Link to={c.to}>{c.label}</Link> : <span className={i === crumbs.length - 1 ? 'is-current' : ''}>{c.label}</span>}
          </span>
        ))}
      </nav>
      <div className="topbar-end">
        <button className="topbar-search" onClick={onPalette} aria-label="Search">
          <Search size={14} />
          <span className="topbar-search__text">Search…</span>
          <kbd className="ui-kbd">⌘K</kbd>
        </button>
        <NotificationBell />
        <UserMenu onShortcuts={onShortcuts} />
      </div>
    </header>
  );
}
