"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = { image: string | null; title: string; subtitle?: string | null; href?: string | null; main?: boolean };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [ref, api] = useEmblaCarousel({ loop: slides.length > 1 }, reduce ? [] : [Autoplay({ delay: 6000, stopOnMouseEnter: true, stopOnInteraction: false })]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const on = () => setIndex(api.selectedScrollSnap());
    on();
    api.on("select", on);
    return () => { api.off("select", on); };
  }, [api]);

  const prev = useCallback(() => api?.scrollPrev(), [api]);
  const next = useCallback(() => api?.scrollNext(), [api]);

  return (
    <section aria-roledescription="karusel" aria-label="Asosiy slayder" className="relative bg-navy text-white">
      <div className="overflow-hidden" ref={ref}>
        <div className="flex">
          {slides.map((s, i) => {
            const body = (
              <div className="relative flex min-h-[70svh] items-end sm:min-h-[calc(100svh-6.5rem)] sm:items-center">
                {s.image ? (
                  <Image src={s.image} alt="" fill sizes="100vw" className="object-cover" priority={i === 0} loading={i === 0 ? undefined : "lazy"} />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.5_0.16_262),transparent_55%),radial-gradient(circle_at_85%_75%,oklch(0.55_0.14_85/.5),transparent_45%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/50 to-navy/20 sm:bg-gradient-to-r sm:from-navy/85 sm:via-navy/50 sm:to-transparent" />
                <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:py-24">
                  {s.main ? <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{s.title}</h1>
                          : <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{s.title}</h2>}
                  {s.subtitle && <p className="mt-4 max-w-xl text-lg text-white/85 sm:text-xl">{s.subtitle}</p>}
                  {s.href && <span className="mt-6 inline-block rounded-lg bg-gold px-5 py-2.5 font-semibold text-black">Batafsil</span>}
                </div>
              </div>
            );
            return (
              <div key={i} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slayd" aria-label={`${i + 1} / ${slides.length}`}>
                {s.href ? <Link href={s.href} className="block">{body}</Link> : body}
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button type="button" onClick={prev} aria-label="Oldingi slayd"
            className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/70 sm:grid"><ChevronLeft /></button>
          <button type="button" onClick={next} aria-label="Keyingi slayd"
            className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/70 sm:grid"><ChevronRight /></button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button key={i} type="button" onClick={() => api?.scrollTo(i)} aria-label={`${i + 1}-slaydga o'tish`} aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-gold" : "w-2.5 bg-white/60 hover:bg-white"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
