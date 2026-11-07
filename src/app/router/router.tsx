import { createBrowserRouter } from 'react-router-dom';
import { MarketingLayout } from '../layouts/MarketingLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppShell } from '../shell/AppShell';
import { RouteErrorPage } from '../errors/RouteErrorPage';
import { RequireAuth, RequirePlatform, RedirectIfAuthed } from './guards';
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
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage';
import { OverviewPage } from '../../features/dashboard/pages/OverviewPage';
import { ProductHomePage } from '../../features/dashboard/pages/ProductHomePage';
import { AssistHomePage } from '../../features/assist/pages/AssistHomePage';
import { InboxPage } from '../../features/assist/pages/InboxPage';
import { BillingPage } from '../../features/assist/pages/BillingPage';
import { SettingsPage } from '../../features/assist/pages/SettingsPage';
import { HandoffsPage } from '../../features/assist/pages/HandoffsPage';
import { HandoffDetailPage } from '../../features/assist/pages/HandoffDetailPage';
import { LeadsPage } from '../../features/assist/pages/LeadsPage';
import { AppointmentsPage } from '../../features/assist/pages/AppointmentsPage';
import { KnowledgePage } from '../../features/assist/pages/KnowledgePage';
import { ReportsPage } from '../../features/assist/pages/ReportsPage';
import { StudioPage } from '../../features/assist/pages/StudioPage';
import { TeamPage } from '../../features/assist/pages/TeamPage';
import { DatasetsPage } from '../../features/insight/pages/DatasetsPage';
import { DatasetDetailPage } from '../../features/insight/pages/DatasetDetailPage';
import { InsightReportsPage } from '../../features/insight/pages/InsightReportsPage';
import { InsightReportDetailPage } from '../../features/insight/pages/InsightReportDetailPage';
import { FlowDefinitionsPage } from '../../features/flow/pages/FlowDefinitionsPage';
import { FlowInstancesPage } from '../../features/flow/pages/FlowInstancesPage';
import { FlowInstanceDetailPage } from '../../features/flow/pages/FlowInstanceDetailPage';
import { FlowTasksPage } from '../../features/flow/pages/FlowTasksPage';
import { AdminOrganizationsPage } from '../../features/admin/pages/AdminOrganizationsPage';
import { AdminOrganizationDetailPage } from '../../features/admin/pages/AdminOrganizationDetailPage';
import { AdminSubscriptionsPage } from '../../features/admin/pages/AdminSubscriptionsPage';
import { AdminUsagePage } from '../../features/admin/pages/AdminUsagePage';

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
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/dashboard', element: <OverviewPage /> },
      { path: '/dashboard/products/:code', element: <ProductHomePage /> },
      { path: '/dashboard/assist', element: <AssistHomePage /> },
      { path: '/dashboard/assist/conversations', element: <InboxPage /> },
      { path: '/dashboard/assist/conversations/:id', element: <InboxPage /> },
      { path: '/dashboard/assist/handoffs', element: <HandoffsPage /> },
      { path: '/dashboard/assist/handoffs/:id', element: <HandoffDetailPage /> },
      { path: '/dashboard/assist/leads', element: <LeadsPage /> },
      { path: '/dashboard/assist/appointments', element: <AppointmentsPage /> },
      { path: '/dashboard/assist/knowledge', element: <KnowledgePage /> },
      { path: '/dashboard/assist/reports', element: <ReportsPage /> },
      { path: '/dashboard/assist/settings', element: <StudioPage /> },
      { path: '/dashboard/team', element: <TeamPage /> },
      { path: '/dashboard/billing', element: <BillingPage /> },
      { path: '/dashboard/settings', element: <SettingsPage /> },
      { path: '/dashboard/insight/datasets', element: <DatasetsPage /> },
      { path: '/dashboard/insight/datasets/:id', element: <DatasetDetailPage /> },
      { path: '/dashboard/insight/reports', element: <InsightReportsPage /> },
      { path: '/dashboard/insight/reports/:id', element: <InsightReportDetailPage /> },
      { path: '/dashboard/flow/definitions', element: <FlowDefinitionsPage /> },
      { path: '/dashboard/flow/instances', element: <FlowInstancesPage /> },
      { path: '/dashboard/flow/instances/:id', element: <FlowInstanceDetailPage /> },
      { path: '/dashboard/flow/tasks', element: <FlowTasksPage /> },
      {
        path: '/dashboard/admin/organizations',
        element: (
          <RequirePlatform>
            <AdminOrganizationsPage />
          </RequirePlatform>
        ),
      },
      {
        path: '/dashboard/admin/organizations/:id',
        element: (
          <RequirePlatform>
            <AdminOrganizationDetailPage />
          </RequirePlatform>
        ),
      },
      {
        path: '/dashboard/admin/subscriptions',
        element: (
          <RequirePlatform>
            <AdminSubscriptionsPage />
          </RequirePlatform>
        ),
      },
      {
        path: '/dashboard/admin/usage',
        element: (
          <RequirePlatform>
            <AdminUsagePage />
          </RequirePlatform>
        ),
      },
    ],
  },
]);
