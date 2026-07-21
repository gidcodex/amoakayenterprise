"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useAdetoBoafo from "./core/useAdetoBoafo.js";

import { createPortal } from "react-dom";

import TourCard from "@/components/ai/TourCard";
import { tourSteps } from "@/components/ai/tourSteps";

const TOUR_COMPLETED_KEY = "amoakay-tour-completed";
const TOUR_LANGUAGE_KEY = "amoakay-tour-language";

const SPOTLIGHT_PADDING = 10;
const MOBILE_BREAKPOINT = 768;
const DESKTOP_CARD_WIDTH = 370;
const DESKTOP_CARD_GAP = 18;
const VIEWPORT_MARGIN = 16;

const emptyRect = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
};

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

const TourEngine = () => {
const [mounted, setMounted] = useState(false);
  
const {
  language,
  changeLanguage,
  tourRunning,
  finishTour,
  closeTour: closeTourContext,
  goToStep,
} = useAdetoBoafo();

  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(emptyRect);
  const [isMobile, setIsMobile] = useState(false);

  const targetElementRef = useRef(null);
  const updateFrameRef = useRef(null);

  const currentStep = tourSteps[stepIndex];

  const findAvailableStep = useCallback((startIndex, direction = 1) => {
    let index = startIndex;

    while (index >= 0 && index < tourSteps.length) {
      const step = tourSteps[index];
      const element = document.querySelector(step.selector);

      if (element) {
        return {
          index,
          element,
        };
      }

      index += direction;
    }

    return null;
  }, []);

  const calculateRect = useCallback((element) => {
    if (!element) return;

    const rect = element.getBoundingClientRect();

    setTargetRect({
      top: Math.max(rect.top - SPOTLIGHT_PADDING, VIEWPORT_MARGIN / 2),
      left: Math.max(rect.left - SPOTLIGHT_PADDING, VIEWPORT_MARGIN / 2),
      right: Math.min(
        rect.right + SPOTLIGHT_PADDING,
        window.innerWidth - VIEWPORT_MARGIN / 2,
      ),
      bottom: Math.min(
        rect.bottom + SPOTLIGHT_PADDING,
        window.innerHeight - VIEWPORT_MARGIN / 2,
      ),
      width: Math.min(
        rect.width + SPOTLIGHT_PADDING * 2,
        window.innerWidth - VIEWPORT_MARGIN,
      ),
      height: Math.min(
        rect.height + SPOTLIGHT_PADDING * 2,
        window.innerHeight - VIEWPORT_MARGIN,
      ),
    });
  }, []);

  const updateSpotlight = useCallback(() => {
    cancelAnimationFrame(updateFrameRef.current);

    updateFrameRef.current = requestAnimationFrame(() => {
      calculateRect(targetElementRef.current);
    });
  }, [calculateRect]);

  const moveToStep = useCallback(
    (requestedIndex, direction = 1) => {
      const available = findAvailableStep(requestedIndex, direction);

      if (!available) {
        return false;
      }
      const { index, element } = available;

      targetElementRef.current = element;
      setStepIndex(index);
      goToStep(index);

      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      window.setTimeout(() => {
        calculateRect(element);
      }, 450);

      return true;
    },
    [calculateRect, findAvailableStep, goToStep,],
  );

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setIsActive(false);
    targetElementRef.current = null;
    finishTour();

    window.dispatchEvent(
      new CustomEvent("amoakay:tour-completed", {
        detail: { language },
      }),
    );
  }, [ finishTour,language]);

  const closeTour = useCallback(() => {
    setIsActive(false);
    targetElementRef.current = null;
    closeTourContext();

    window.dispatchEvent(
      new CustomEvent("amoakay:tour-closed", {
        detail: { language },
      }),
    );
  }, [ closeTourContext,language]);

  const handleNext = useCallback(() => {
    const moved = moveToStep(stepIndex + 1, 1);

    if (!moved) {
      completeTour();
    }
  }, [completeTour, moveToStep, stepIndex]);

  const handlePrevious = useCallback(() => {
    moveToStep(stepIndex - 1, -1);
  }, [moveToStep, stepIndex]);

 const handleLanguageChange = useCallback(
  (newLanguage) => {
    changeLanguage(newLanguage);

    localStorage.setItem(
      TOUR_LANGUAGE_KEY,
      newLanguage
    );
  },
  [changeLanguage]
);

useEffect(() => {
  setMounted(true);
  const savedLanguage =
    localStorage.getItem(
      TOUR_LANGUAGE_KEY
    );
  if (
    savedLanguage === "en" ||
    savedLanguage === "tw"
  ) {
    changeLanguage(savedLanguage);
  }
}, [changeLanguage]);

 
useEffect(() => {
  if (!mounted || !tourRunning || isActive) {
    return;
  }

  const firstAvailable = findAvailableStep(0, 1);

  if (!firstAvailable) {
    console.warn(
      "Adetɔ Boafo: No elements with matching data-tour attributes were found.",
    );

    closeTourContext();
    return;
  }

  localStorage.removeItem(TOUR_COMPLETED_KEY);

  setIsActive(true);
  setStepIndex(firstAvailable.index);
  goToStep(firstAvailable.index);

  targetElementRef.current = firstAvailable.element;

  firstAvailable.element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });

  const timer = window.setTimeout(() => {
    calculateRect(firstAvailable.element);
  }, 450);

  return () => {
    window.clearTimeout(timer);
  };
}, [
  mounted,
  tourRunning,
  isActive,
  findAvailableStep,
  calculateRect,
  closeTourContext,
  goToStep,
]);

  useEffect(() => {
    if (!isActive) return;

    const updateViewport = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      updateSpotlight();
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("scroll", updateSpotlight, true);
      cancelAnimationFrame(updateFrameRef.current);
    };
  }, [isActive, updateSpotlight]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeTour();
      }

      if (event.key === "ArrowRight") {
        handleNext();
      }

      if (event.key === "ArrowLeft" && stepIndex > 0) {
        handlePrevious();
      }
    };

    const originalOverflow = document.body.style.overflow;

    /*
      Desktop still permits controlled scrolling so the tour can move to
      sections farther down the homepage. On mobile, the bottom sheet remains
      usable while scrollIntoView moves the highlighted element.
    */
    document.body.style.overscrollBehavior = "contain";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    closeTour,
    handleNext,
    handlePrevious,
    isActive,
    stepIndex,
  ]);

  if (!mounted || !isActive || !currentStep) {
    return null;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const spaceBelow = viewportHeight - targetRect.bottom;
  const spaceAbove = targetRect.top;
  const spaceRight = viewportWidth - targetRect.right;
  const spaceLeft = targetRect.left;

  let cardLeft;
  let cardTop;

  if (spaceRight >= DESKTOP_CARD_WIDTH + DESKTOP_CARD_GAP) {
    cardLeft = targetRect.right + DESKTOP_CARD_GAP;
    cardTop = targetRect.top;
  } else if (spaceLeft >= DESKTOP_CARD_WIDTH + DESKTOP_CARD_GAP) {
    cardLeft = targetRect.left - DESKTOP_CARD_WIDTH - DESKTOP_CARD_GAP;
    cardTop = targetRect.top;
  } else if (spaceBelow >= 330) {
    cardLeft = targetRect.left;
    cardTop = targetRect.bottom + DESKTOP_CARD_GAP;
  } else {
    cardLeft = targetRect.left;
    cardTop = targetRect.top - 330 - DESKTOP_CARD_GAP;
  }

  cardLeft = clamp(
    cardLeft,
    VIEWPORT_MARGIN,
    viewportWidth - DESKTOP_CARD_WIDTH - VIEWPORT_MARGIN,
  );

  cardTop = clamp(cardTop, VIEWPORT_MARGIN, viewportHeight - 350);

  const cardPosition = {
    left: cardLeft,
    top: cardTop,
    width: DESKTOP_CARD_WIDTH,
  };

  const overlay = (
    <div className="fixed inset-0 z-[10000]">
      {/* Four overlay panels create a true transparent spotlight opening */}
      <div
        className="adeto-tour-overlay-piece fixed left-0 right-0 top-0 bg-slate-950/72 backdrop-blur-[2px]"
        style={{
          height: `${targetRect.top}px`,
        }}
      />

      <div
        className="adeto-tour-overlay-piece fixed bottom-0 left-0 right-0 bg-slate-950/72 backdrop-blur-[2px]"
        style={{
          top: `${targetRect.bottom}px`,
        }}
      />

      <div
        className="adeto-tour-overlay-piece fixed left-0 bg-slate-950/72 backdrop-blur-[2px]"
        style={{
          top: `${targetRect.top}px`,
          width: `${targetRect.left}px`,
          height: `${targetRect.height}px`,
        }}
      />

      <div
        className="adeto-tour-overlay-piece fixed right-0 bg-slate-950/72 backdrop-blur-[2px]"
        style={{
          top: `${targetRect.top}px`,
          left: `${targetRect.right}px`,
          height: `${targetRect.height}px`,
        }}
      />

      {/* Animated border around the highlighted element */}
      <div
        aria-hidden="true"
        className="adeto-tour-spotlight pointer-events-none fixed z-[10002] rounded-2xl border-2 border-emerald-400"
        style={{
          top: `${targetRect.top}px`,
          left: `${targetRect.left}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
        }}
      >
        <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-lime-400 shadow-[0_0_15px_rgba(190,242,100,0.9)]" />
      </div>

      <TourCard
        step={currentStep}
        stepIndex={stepIndex}
        totalSteps={tourSteps.length}
        language={language}
        position={cardPosition}
        isMobile={isMobile}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={closeTour}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );

  return createPortal(overlay, document.body);
};

export default TourEngine;