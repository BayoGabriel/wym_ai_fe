import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { ButtonLink } from '../../shared/components/Button';
import { useDocumentTitle } from '../../shared/utils/useDocumentTitle';
import { useLightTheme } from '../../shared/prefs/prefs';

export function RouteErrorPage() {
  const error = useRouteError();
  useDocumentTitle('Something went wrong');
  useLightTheme();

  const title = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'Page not found'
      : `Error ${error.status}`
    : 'Something went wrong';
  const message = isRouteErrorResponse(error)
    ? error.statusText || 'The route could not be completed.'
    : 'An unexpected error occurred while loading this page.';

  return (
    <div className="errorpage">
      <div className="errorpage__card" role="alert">
        <Link to="/" className="errorpage__brand">
          <img src="/brand/wymnet-logo.png" alt="" aria-hidden />
          WymNet
        </Link>
        <h1>{title}</h1>
        <p className="muted">{message}</p>
        <div className="errorpage__actions">
          <ButtonLink to="/">Back to home</ButtonLink>
          <ButtonLink to="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
