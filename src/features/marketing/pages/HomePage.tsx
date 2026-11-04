import { HomeHero } from '../components/home/HomeHero';
import { CapabilityStrip } from '../components/home/CapabilityStrip';
import { HowItWorks } from '../components/home/HowItWorks';
import { FeatureGrid } from '../components/home/FeatureGrid';
import { LoopBand } from '../components/home/LoopBand';
import { PlatformStats } from '../components/home/PlatformStats';
import { FitSection } from '../components/home/FitSection';
import { FaqSection } from '../components/home/FaqSection';
import { GetStarted } from '../components/home/GetStarted';
import { ProductCards } from '../components/ProductCards';
import { FinalCta } from '../components/FinalCta';
import { SectionHead } from '../components/SectionHead';
import { Reveal } from '../components/Reveal';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function HomePage() {
  useDocumentTitle(
    'AI Customer Support, Business Intelligence & Process Automation',
    'WymNet AI Solutions & Automation builds practical AI software: WymAssist for customer conversations, WymInsight for data analytics, and WymFlow for process automation.'
  );
  return (
    <>
      <HomeHero />
      <CapabilityStrip />
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="The product family"
              title="Three products for three jobs every organization has"
              lede="WymAssist handles customer conversations. WymInsight turns your data into decisions. WymFlow keeps internal processes moving. Each is a standalone product — subscribe to what you need, nothing else."
            />
          </Reveal>
          <Reveal delay={80}>
            <ProductCards />
          </Reveal>
        </div>
      </section>
      <FeatureGrid />
      <LoopBand />
      <HowItWorks />
      <PlatformStats />
      <FitSection />
      <FaqSection />
      <GetStarted />
      <FinalCta />
    </>
  );
}
