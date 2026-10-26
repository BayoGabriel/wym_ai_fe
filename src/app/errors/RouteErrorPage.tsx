import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ButtonLink } from '../../shared/components/Button';
import { useDocumentTitle } from '../../shared/utils/useDocumentTitle';

export function RouteErrorPage() {
  const error = useRouteError();
  useDocumentTitle('Something went wrong');

  const title = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'Page not found'
      : `Error ${error.status}`
    : 'Something went wrong';
  const message = isRouteErrorResponse(error)
    ? error.statusText || 'The route could not be completed.'
    : 'An unexpected error occurred while loading this page.';

  return (
    <div className="container">
      <div className="state-box" role="alert" style={{ padding: 'var(--space-12)' }}>
        <h1>{title}</h1>
        <p className="muted">{message}</p>
        <ButtonLink to="/">Back to home</ButtonLink>
      </div>
    </div>
  );
}
