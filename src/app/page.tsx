import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import EnvelopeIntro from "@/components/EnvelopeIntro";
import Quote from "@/components/Quote";
import Countdown from "@/components/Countdown";
import Events from "@/components/Events";
import Itinerary from "@/components/Itinerary";
import { DressCode, NoKids } from "@/components/Details";
import Families from "@/components/Families";
import Gifts from "@/components/Gifts";
import Hotels from "@/components/Hotels";
import Rsvp from "@/components/Rsvp";
import Footer from "@/components/Footer";
import VideosSection from "@/components/VideosSection";
import {
  PhotoFeature,
  PhotoDuo,
  PhotoSingle,
  placements,
} from "@/components/Photos";
import SectionDivider from "@/components/SectionDivider";
import { WEDDING } from "@/lib/data";

export default function Home() {
  return (
    <>
      <EnvelopeIntro />
      <Nav />
      <main>
        <Hero />
        <VideosSection />
        <Quote />
        <SectionDivider />
        <PhotoFeature photo={placements.feature} bg="bg-linen" />
        <section className="bg-linen py-24 text-center sm:py-28">
          <div className="reveal mx-auto max-w-3xl px-6">
            <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-charcoal-soft sm:text-lg">
              {WEDDING.intro}
            </p>
            <p className="mt-8 font-serif text-4xl font-medium text-charcoal sm:text-5xl">
              {WEDDING.date}
            </p>
            <p className="mt-10 text-[0.7rem] uppercase tracking-[0.35em] text-bronze">
              Faltan
            </p>
            <div className="reveal mt-8">
              <Countdown target={WEDDING.dateISO} />
            </div>
          </div>
        </section>
        <SectionDivider />
        <PhotoSingle photo={placements.singleOne} bg="bg-linen" />
        <Families />
        <SectionDivider />
        <PhotoDuo photos={placements.duoOne} bg="bg-linen" />
        <Events />
        <SectionDivider />
        <DressCode />
        <SectionDivider />
        <PhotoSingle photo={placements.singleTwo} bg="bg-linen" />
        <NoKids />
        <SectionDivider />
        <Itinerary />
        <SectionDivider />
        <PhotoDuo photos={placements.duoTwo} bg="bg-linen" />
        <Gifts />
        <SectionDivider />
        <PhotoDuo photos={placements.duoThree} bg="bg-linen" />
        <Hotels />
        <SectionDivider />
        <PhotoDuo photos={placements.duoFour} bg="bg-linen" />
        <Rsvp />
      </main>
      <Footer />
    </>
  );
}