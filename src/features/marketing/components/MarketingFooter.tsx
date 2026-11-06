import { Link } from 'react-router-dom';
import { env } from '../../../shared/config/env';

export function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand">
            <img className="brand-mark" src="/brand/wymnet-logo.png" alt="" aria-hidden />
            WymNet
          </Link>
          <p className="footer-blurb">
            Practical AI software for customer communication, business intelligence, and process
            automation — on one secure platform.
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
        <span>WymAssist · WymInsight · WymFlow — each product stands alone.</span>
      </div>
    </footer>
  );
}
