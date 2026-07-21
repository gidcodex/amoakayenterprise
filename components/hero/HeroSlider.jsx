"use client";

import {
  ArrowLeft,
  ArrowRight,
  Flame,
  ImageOff,
  Pause,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { heroSlides } from "./HeroSlides";

const AUTOPLAY_DELAY = 6000;
const SWIPE_DISTANCE = 50;

export default function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const totalSlides = heroSlides.length;

  const goToSlide = useCallback(
    (index) => {
      if (totalSlides === 0) return;

      const normalizedIndex =
        (index + totalSlides) % totalSlides;

      setActiveSlide(normalizedIndex);
    },
    [totalSlides]
  );

  const showNextSlide = useCallback(() => {
    setActiveSlide((currentSlide) => {
      return (currentSlide + 1) % totalSlides;
    });
  }, [totalSlides]);

  const showPreviousSlide = useCallback(() => {
    setActiveSlide((currentSlide) => {
      return (
        (currentSlide - 1 + totalSlides) %
        totalSlides
      );
    });
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) {
      return undefined;
    }

    const autoplayTimer = window.setInterval(() => {
      setActiveSlide((currentSlide) => {
        return (currentSlide + 1) % totalSlides;
      });
    }, AUTOPLAY_DELAY);

    return () => {
      window.clearInterval(autoplayTimer);
    };
  }, [isPaused, totalSlides]);

  useEffect(() => {
    const handleKeyboardNavigation = (event) => {
      if (event.key === "ArrowLeft") {
        showPreviousSlide();
      }

      if (event.key === "ArrowRight") {
        showNextSlide();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboardNavigation
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardNavigation
      );
    };
  }, [showNextSlide, showPreviousSlide]);

  const handleTouchStart = (event) => {
    touchStartX.current =
      event.targetTouches[0].clientX;

    touchEndX.current = null;
  };

  const handleTouchMove = (event) => {
    touchEndX.current =
      event.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      return;
    }

    const swipeDistance =
      touchStartX.current - touchEndX.current;

    if (swipeDistance > SWIPE_DISTANCE) {
      showNextSlide();
    }

    if (swipeDistance < -SWIPE_DISTANCE) {
      showPreviousSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleImageError = (slideId) => {
    setImageErrors((currentErrors) => ({
      ...currentErrors,
      [slideId]: true,
    }));
  };

  if (totalSlides === 0) {
    return null;
  }

  return (
    <section
      className="
        group relative isolate
        rounded-2xl
        w-full
        overflow-hidden
        bg-slate-950
        min-h-[280px]
        sm:min-h-[420px]
        lg:min-h-[560px]
        xl:min-h-[620px]
       "
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Amoakay Deals promotional offers"
    >
      {heroSlides.map((slide, index) => {
        const isActive = index === activeSlide;
        const hasImageError =
          imageErrors[slide.id];

        return (
          <article
            key={slide.id}
            aria-hidden={!isActive}
            className={`
              absolute inset-0
              transition-all
              duration-700
              ease-in-out
              ${
                isActive
                  ? "pointer-events-auto scale-100 opacity-100"
                  : "pointer-events-none scale-[1.015] opacity-0"
              }
            `}
          >
            {!hasImageError ? (
              <Link
                href={slide.href}
                aria-label={`Shop ${slide.name}`}
                tabIndex={isActive ? 0 : -1}
                className="absolute inset-0 block"
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  quality={90}
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  onError={() =>
                    handleImageError(slide.id)
                  }
                  className={`
                    object-contain
                    object-center
                    transition-all
                    duration-[7000ms]
                    ease-out
                    ${
                      isActive && !isPaused
                        ? "scale-[1.04]"
                        : "scale-100"
                    }
                  `}
                />

                {/* Subtle premium overlay */}
                 <div
                   className="
                   absolute
                   inset-0
                   pointer-events-none
                   bg-gradient-to-r
                   from-black/10
                   via-transparent
                   to-black/5
                   "
                 />
                <span className="sr-only">
                  Open the {slide.name} promotion
                </span>
              </Link>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 text-white">
                <div className="flex max-w-md flex-col items-center text-center">
                  <ImageOff size={44} />

                  <p className="mt-4 text-xl font-black">
                    {slide.name}
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    The promotional banner could not be
                    loaded.
                  </p>

                  <code className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs text-white/80">
                    {slide.image}
                  </code>
                </div>
              </div>
            )}
          </article>
        );
      })}


      {/* Slight edge shading for controls */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-black/10 via-transparent to-black/10"
      />

      {/* Floating Today's Deals card */}
<Link
  href="/shop"
  className="
    absolute right-5 top-5 z-30
    hidden w-[220px]
    rounded-2xl
    border border-white/25
    bg-slate-950/75
    p-4
    text-white
    shadow-xl
    backdrop-blur-xl
    transition
    duration-300
    hover:-translate-y-1
    hover:bg-slate-950/90
    lg:block
  "
>
  <div className="flex items-center gap-2">
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
      <Flame size={18} fill="currentColor" />
    </span>

    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-300">
        Today&apos;s Deals
      </p>

      <p className="text-lg font-black">
        Up to 30% Off
      </p>
    </div>
  </div>

  <div className="mt-3 space-y-1.5 text-xs font-medium text-white/75">
    <p>Selected electronics</p>
    <p>Fast delivery nationwide</p>
    <p>Limited-time offers</p>
  </div>

  <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
    <span className="text-sm font-bold">
      View all deals
    </span>

    <ArrowRight size={17} />
  </div>
</Link>

      {/* Previous and next arrows */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={showPreviousSlide}
            aria-label="Show previous promotion"
            className="
              absolute left-3 top-1/2 z-40
              flex h-10 w-10
              -translate-y-1/2
              items-center justify-center
              rounded-full
              border border-white/25
              bg-black/30
              text-white
              shadow-lg
              backdrop-blur-md
              transition
              hover:scale-105
              hover:bg-white
              hover:text-slate-950
              sm:left-4
              sm:h-11
              sm:w-11
            "
          >
            <ArrowLeft size={19} />
          </button>

          <button
            type="button"
            onClick={showNextSlide}
            aria-label="Show next promotion"
            className="
              absolute right-3 top-1/2 z-40
              flex h-10 w-10
              -translate-y-1/2
              items-center justify-center
              rounded-full
              border border-white/25
              bg-black/30
              text-white
              shadow-lg
              backdrop-blur-md
              transition
              hover:scale-105
              hover:bg-white
              hover:text-slate-950
              sm:right-4
              sm:h-11
              sm:w-11
            "
          >
            <ArrowRight size={19} />
          </button>
        </>
      )}

      {/* Slide number and progress */}
      <div className="absolute bottom-4 left-4 z-40 hidden items-center gap-3 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs font-bold text-white backdrop-blur-md sm:flex">
        <span>
          {String(activeSlide + 1).padStart(2, "0")}
        </span>

        <div className="h-0.5 w-16 overflow-hidden rounded-full bg-white/30">
          <div
            key={`progress-${activeSlide}-${isPaused}`}
            className={`
              h-full bg-white
              ${
                isPaused
                  ? "w-full"
                  : "animate-[heroProgress_6s_linear_forwards]"
              }
            `}
          />
        </div>

        <span>
          {String(totalSlides).padStart(2, "0")}
        </span>
      </div>

      {/* Pagination and pause controls */}
      <div className="absolute inset-x-0 bottom-4 z-40 flex items-center justify-center gap-3 px-16">
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-2 backdrop-blur-md">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Show ${slide.name} promotion`}
              aria-current={
                activeSlide === index
                  ? "true"
                  : undefined
              }
              className={`
                h-2 rounded-full
                transition-all
                duration-300
                ${
                  activeSlide === index
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }
              `}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setIsPaused((currentValue) => !currentValue)
          }
          aria-label={
            isPaused
              ? "Resume automatic slider"
              : "Pause automatic slider"
          }
          className="
            flex h-9 w-9
            shrink-0
            items-center justify-center
            rounded-full
            border border-white/20
            bg-black/35
            text-white
            backdrop-blur-md
            transition
            hover:bg-white
            hover:text-slate-950
          "
        >
          {isPaused ? (
            <Play size={15} fill="currentColor" />
          ) : (
            <Pause size={15} fill="currentColor" />
          )}
        </button>
      </div>
    </section>
  );
}