import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppErrorBoundary } from './errors/AppErrorBoundary';
import { router } from './router/router';

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </AppErrorBoundary>
  );
}
