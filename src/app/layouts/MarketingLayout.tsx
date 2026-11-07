import { Outlet } from 'react-router-dom';
import { MarketingHeader } from '../../features/marketing/components/MarketingHeader';
import { MarketingFooter } from '../../features/marketing/components/MarketingFooter';
import { useLightTheme } from '../../shared/prefs/prefs';
import '../../features/marketing/styles/marketing.css';

export function MarketingLayout() {
  useLightTheme();
  return (
    <>
      <MarketingHeader />
      <main>
        <Outlet />
      </main>
      <MarketingFooter />
    </>
  );
}
