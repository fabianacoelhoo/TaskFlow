import { Box } from '@mui/material';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { ProductShowcase } from '../components/landing/ProductShowcase';
import { AiHighlight } from '../components/landing/AiHighlight';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ImageBanner } from '../components/landing/ImageBanner';
import { Pricing } from '../components/landing/Pricing';
import { FinalCta } from '../components/landing/FinalCta';
import { LandingFooter } from '../components/landing/LandingFooter';

export function LandingPage() {
  return (
    <Box>
      <LandingNavbar />
      <LandingHero />
      <FeatureGrid />
      <ProductShowcase />
      <AiHighlight />
      <HowItWorks />
      <ImageBanner />
      <Pricing />
      <FinalCta />
      <LandingFooter />
    </Box>
  );
}
