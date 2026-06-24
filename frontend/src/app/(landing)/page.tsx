import { SocialProofStrip } from "@/components/landing/SocialProofStrip";
import { HeroTerminal } from "@/components/landing/HeroTerminal";
import { BentoFeatures } from "@/components/landing/BentoFeatures";

export default function Home() {
  return (
    <div className="flex flex-col w-full items-center">
      <HeroTerminal />
      <SocialProofStrip />
      <BentoFeatures />
    </div>
  );
}
