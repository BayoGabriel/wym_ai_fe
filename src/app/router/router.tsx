import { createBrowserRouter } from 'react-router-dom';
import { MarketingLayout } from '../layouts/MarketingLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { RouteErrorPage } from '../errors/RouteErrorPage';
import { RequireAuth, RedirectIfAuthed } from './guards';
import { HomePage } from '../../features/marketing/pages/HomePage';
import { ProductsPage } from '../../features/marketing/pages/ProductsPage';
import { ProductDetailPage } from '../../features/marketing/pages/ProductDetailPage';
import { UseCasesPage } from '../../features/marketing/pages/UseCasesPage';
import { PricingPage } from '../../features/marketing/pages/PricingPage';
import { AboutPage } from '../../features/marketing/pages/AboutPage';
import { ContactPage } from '../../features/marketing/pages/ContactPage';
import { NotFoundPage } from '../../features/marketing/pages/NotFoundPage';
import { SignInPage } from '../../features/auth/pages/SignInPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { OverviewPage } from '../../features/dashboard/pages/OverviewPage';
import { ProductHomePage } from '../../features/dashboard/pages/ProductHomePage';

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
      { path: '/use-cases', element: <UseCasesPage /> },
      { path: '/pricing', element: <PricingPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: (
      <RedirectIfAuthed>
        <AuthLayout />
      </RedirectIfAuthed>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/dashboard', element: <OverviewPage /> },
      { path: '/dashboard/products/:code', element: <ProductHomePage /> },
    ],
  },
]);
