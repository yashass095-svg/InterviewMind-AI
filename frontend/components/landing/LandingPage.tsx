import { Header } from "./Header";
import { HeroSection } from "./HeroSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}
