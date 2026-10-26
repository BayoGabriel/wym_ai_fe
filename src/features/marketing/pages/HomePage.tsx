import { HomeHero } from '../components/home/HomeHero';
import { HowItWorks } from '../components/home/HowItWorks';
import { LoopBand } from '../components/home/LoopBand';
import { FitSection } from '../components/home/FitSection';
import { GetStarted } from '../components/home/GetStarted';
import { ProductLines } from '../components/ProductLines';
import { FinalCta } from '../components/FinalCta';
import { SectionHead } from '../components/SectionHead';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function HomePage() {
  useDocumentTitle(
    'Organizational AI, business intelligence & automation',
    'WymNet builds organizational AI. WymAssist answers customer questions from your approved knowledge, captures leads, and hands off to your team.'
  );
  return (
    <>
      <HomeHero />
      <HowItWorks />
      <LoopBand />
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="The product family"
            title="One platform, three jobs"
            lede="WymAssist is available today. WymInsight and WymFlow are the intelligence and automation directions of the same platform — clearly marked as planned until they ship."
          />
          <ProductLines />
        </div>
      </section>
      <FitSection />
      <GetStarted />
      <FinalCta />
    </>
  );
}
