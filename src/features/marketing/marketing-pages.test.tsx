import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MarketingLayout } from '../../app/layouts/MarketingLayout';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { UseCasesPage } from './pages/UseCasesPage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/use-cases" element={<UseCasesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('marketing shell', () => {
  it('renders header nav and footer on every page', () => {
    renderPage('/');
    expect(screen.getAllByRole('link', { name: /products/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /get started/i })[0]).toHaveAttribute(
      'href',
      '/register'
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('toggles mobile navigation', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    renderPage('/');
    const toggle = screen.getByRole('button', { name: /toggle navigation/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('marketing pages', () => {
  it('home explains the product family with CTAs', () => {
    renderPage('/');
    expect(
      screen.getByRole('heading', { name: /answer every customer/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /get started/i })[0]).toHaveAttribute(
      'href',
      '/register'
    );
    expect(screen.getAllByText(/WymAssist AI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WymInsight AI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WymFlow AI/i).length).toBeGreaterThan(0);
  });

  it('products page lists all three products with honest status', () => {
    renderPage('/products');
    expect(screen.getAllByText('Available now').length).toBeGreaterThanOrEqual(3);
  });

  it('product detail renders WymAssist capabilities', () => {
    renderPage('/products/wymassist');
    expect(screen.getByRole('heading', { name: 'WymAssist AI' })).toBeInTheDocument();
    expect(screen.getAllByText(/human handoff/i).length).toBeGreaterThan(0);
  });

  it('unknown product slugs render a not-found state', () => {
    renderPage('/products/nope');
    expect(screen.getByRole('heading', { name: /product not found/i })).toBeInTheDocument();
  });

  it('pricing is honest contact-for-pricing, no invented tiers', () => {
    renderPage('/pricing');
    expect(screen.getByText(/doesn’t publish a fixed price list/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /email us about pricing/i })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:/)
    );
    expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument();
  });

  it('contact page uses a real mailto destination', () => {
    renderPage('/contact');
    const emails = screen.getAllByRole('link', { name: /@wymnet\.ai/i });
    expect(emails.length).toBeGreaterThan(0);
    emails.forEach((email) =>
      expect(email).toHaveAttribute('href', expect.stringMatching(/^mailto:/))
    );
  });

  it('about and use-cases pages render their core content', () => {
    renderPage('/about');
    expect(
      screen.getByRole('heading', { name: /real work to do/i })
    ).toBeInTheDocument();
    renderPage('/use-cases');
    expect(screen.getByText(/escalating to staff/i)).toBeInTheDocument();
  });

  it('not-found route renders a helpful 404', () => {
    renderPage('/some-missing-page');
    expect(
      screen.getByRole('heading', { name: /this page drifted out of orbit/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });
});
