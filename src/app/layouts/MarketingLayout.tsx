import { Outlet } from 'react-router-dom';
import { MarketingHeader } from '../../features/marketing/components/MarketingHeader';
import { MarketingFooter } from '../../features/marketing/components/MarketingFooter';
import '../../features/marketing/styles/marketing.css';

export function MarketingLayout() {
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
