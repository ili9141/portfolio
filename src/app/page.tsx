import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FieldColor } from "@/components/LatentField";
import { LossCurve } from "@/components/motion";
import { Contact, Figures, Lama, Path, Projects, Skills } from "@/components/Sections";

export default function Home() {
  return (
    <div className="theme-root" data-theme="magenta">
      <FieldColor theme="magenta" />
      <Header />
      <main className="relative z-10">
        <Hero />
        <Figures />
        <Lama />
        <LossCurve />
        <Projects />
        <LossCurve />
        <Path />
        <LossCurve />
        <Skills />
        <Contact />
      </main>
    </div>
  );
}
