import { Link } from 'react-router-dom';
import { env } from '../../../shared/config/env';

export function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand">
            <span className="logo-mark" aria-hidden>
              W
            </span>
            WymNet
          </Link>
          <p className="footer-blurb">
            Software that makes organizational knowledge useful — for customers, for staff, and for
            the systems they work in.
          </p>
        </div>
        <nav aria-label="Products">
          <div className="footer-heading">Products</div>
          <Link to="/products/wymassist">WymAssist AI</Link>
          <Link to="/products/wyminsight">WymInsight AI</Link>
          <Link to="/products/wymflow">WymFlow AI</Link>
          <Link to="/products">Product overview</Link>
        </nav>
        <nav aria-label="Company">
          <div className="footer-heading">Company</div>
          <Link to="/about">About</Link>
          <Link to="/use-cases">Use cases</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <nav aria-label="Account">
          <div className="footer-heading">Account</div>
          <Link to="/register">Get started</Link>
          <Link to="/sign-in">Sign in</Link>
          <a href={`mailto:${env.VITE_CONTACT_EMAIL}`}>{env.VITE_CONTACT_EMAIL}</a>
        </nav>
      </div>
      <div className="container bottom">
        <span>© {new Date().getFullYear()} WymNet AI Solutions &amp; Automation</span>
        <span>WymAssist answers are grounded in your approved knowledge.</span>
      </div>
    </footer>
  );
}
