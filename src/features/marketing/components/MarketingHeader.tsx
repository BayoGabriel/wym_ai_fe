import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ButtonLink } from '../../../shared/components/Button';

const NAV_LINKS = [
  { to: '/products', label: 'Products' },
  { to: '/use-cases', label: 'Use cases' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand" onClick={close}>
          <span className="logo-mark" aria-hidden>
            W
          </span>
          WymNet
        </Link>
        <nav className="nav-desktop" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to="/sign-in" className="signin-link">
            Sign in
          </Link>
          <ButtonLink to="/register">Get started</ButtonLink>
        </div>
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <nav className={`nav-mobile ${open ? 'open' : ''}`} aria-label="Mobile">
        {NAV_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={close}>
            {l.label}
          </NavLink>
        ))}
        <Link to="/sign-in" onClick={close}>
          Sign in
        </Link>
        <div className="nav-mobile-cta">
          <ButtonLink to="/register">Get started</ButtonLink>
        </div>
      </nav>
    </header>
  );
}
