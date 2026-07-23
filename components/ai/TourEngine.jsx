"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import useAdetoBoafo from "./core/useAdetoBoafo.js";

import TourCard from "@/components/ai/TourCard";
import { tourSteps } from "@/components/ai/tourSteps";

const TOUR_COMPLETED_KEY =
  "amoakay-tour-completed";

const TOUR_LANGUAGE_KEY =
  "amoakay-tour-language";

const SPOTLIGHT_PADDING = 10;
const MOBILE_BREAKPOINT = 768;

const MOBILE_CARD_HEIGHT_ESTIMATE = 360;
const MOBILE_CARD_GAP = 18;
const MOBILE_TOP_MARGIN = 90;

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

const clamp = (
  value,
  minimum,
  maximum
) =>
  Math.min(
    Math.max(value, minimum),
    maximum
  );

const TourEngine = () => {
  const [mounted, setMounted] =
    useState(false);

  const {
    language,
    changeLanguage,
    tourRunning,
    finishTour,
    closeTour: closeTourContext,
    goToStep,
  } = useAdetoBoafo();

  const [isActive, setIsActive] =
    useState(false);

  const [stepIndex, setStepIndex] =
    useState(0);

  const [targetRect, setTargetRect] =
    useState(emptyRect);

  const [isMobile, setIsMobile] =
    useState(false);

  const [
    mobileCardPlacement,
    setMobileCardPlacement,
  ] = useState("bottom");

  const targetElementRef = useRef(null);
  const updateFrameRef = useRef(null);

  const firstTimerRef = useRef(null);
  const secondTimerRef = useRef(null);
  const menuTimerRef = useRef(null);

  const currentStep =
    tourSteps[stepIndex];

  /*
   * Returns true when the current viewport
   * should use the mobile tour behaviour.
   */
  const isMobileViewport =
    useCallback(() => {
      if (typeof window === "undefined") {
        return false;
      }

      return (
        window.innerWidth <
        MOBILE_BREAKPOINT
      );
    }, []);

  /*
   * An element is considered visible only
   * when it is actually rendered and has size.
   */
  const isElementVisible = useCallback(
    (element) => {
      if (
        !element ||
        typeof window === "undefined"
      ) {
        return false;
      }

      const rect =
        element.getBoundingClientRect();

      const style =
        window.getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    },
    []
  );

  /*
   * The mobile menu is open when one of its
   * mobile-only targets exists and is visible.
   */
  const isMobileMenuOpen =
    useCallback(() => {
      if (!isMobileViewport()) {
        return false;
      }

      const mobileMenuTarget =
        document.querySelector(
          '[data-tour="search-mobile"]'
        );

      return isElementVisible(
        mobileMenuTarget
      );
    }, [
      isElementVisible,
      isMobileViewport,
    ]);

  /*
   * Uses the real Navbar hamburger button.
   * No custom window events are required.
   */
  const toggleMobileMenu = useCallback(
    (shouldOpen) => {
      if (!isMobileViewport()) {
        return;
      }

      const currentlyOpen =
        isMobileMenuOpen();

      if (
        currentlyOpen === shouldOpen
      ) {
        return;
      }

      const toggleButton =
        document.querySelector(
          '[data-tour="mobile-menu-toggle"]'
        );

      if (
        toggleButton instanceof
        HTMLElement
      ) {
        toggleButton.click();
      }
    },
    [
      isMobileMenuOpen,
      isMobileViewport,
    ]
  );

  /*
   * Chooses whether the mobile tour card should
   * appear at the top or bottom of the screen.
   */
  const calculateMobileCardPlacement =
    useCallback((rect) => {
      if (
        !rect ||
        typeof window === "undefined" ||
        window.innerWidth >=
          MOBILE_BREAKPOINT
      ) {
        return;
      }

      const viewportHeight =
        window.innerHeight;

      const spaceAbove = rect.top;

      const spaceBelow =
        viewportHeight - rect.bottom;

      if (
        spaceBelow >=
        MOBILE_CARD_HEIGHT_ESTIMATE +
          MOBILE_CARD_GAP
      ) {
        setMobileCardPlacement(
          "bottom"
        );

        return;
      }

      if (
        spaceAbove >=
        MOBILE_CARD_HEIGHT_ESTIMATE +
          MOBILE_CARD_GAP
      ) {
        setMobileCardPlacement("top");

        return;
      }

      setMobileCardPlacement(
        rect.top <
          viewportHeight / 2
          ? "bottom"
          : "top"
      );
    }, []);

  /*
   * Calculates the spotlight rectangle.
   */
  const calculateRect = useCallback(
    (element) => {
      if (
        !element ||
        !isElementVisible(element)
      ) {
        return;
      }

      const rect =
        element.getBoundingClientRect();

      const nextRect = {
        top: Math.max(
          rect.top -
            SPOTLIGHT_PADDING,
          VIEWPORT_MARGIN / 2
        ),

        left: Math.max(
          rect.left -
            SPOTLIGHT_PADDING,
          VIEWPORT_MARGIN / 2
        ),

        right: Math.min(
          rect.right +
            SPOTLIGHT_PADDING,
          window.innerWidth -
            VIEWPORT_MARGIN / 2
        ),

        bottom: Math.min(
          rect.bottom +
            SPOTLIGHT_PADDING,
          window.innerHeight -
            VIEWPORT_MARGIN / 2
        ),

        width: Math.min(
          rect.width +
            SPOTLIGHT_PADDING * 2,
          window.innerWidth -
            VIEWPORT_MARGIN
        ),

        height: Math.min(
          rect.height +
            SPOTLIGHT_PADDING * 2,
          window.innerHeight -
            VIEWPORT_MARGIN
        ),
      };

      setTargetRect(nextRect);

      calculateMobileCardPlacement(
        nextRect
      );
    },
    [
      calculateMobileCardPlacement,
      isElementVisible,
    ]
  );

  const updateSpotlight =
    useCallback(() => {
      if (
        updateFrameRef.current
      ) {
        cancelAnimationFrame(
          updateFrameRef.current
        );
      }

      updateFrameRef.current =
        requestAnimationFrame(() => {
          calculateRect(
            targetElementRef.current
          );
        });
    }, [calculateRect]);

  /*
   * Returns the correct selector for the
   * current desktop or mobile viewport.
   */
  const getStepSelector =
    useCallback(
      (step) => {
        if (!step) {
          return null;
        }

        if (
          isMobileViewport() &&
          step.mobileSelector
        ) {
          return step.mobileSelector;
        }

        return step.selector;
      },
      [isMobileViewport]
    );

  /*
   * Finds the next valid tour step.
   *
   * Mobile-menu steps may temporarily have no
   * target because the menu has not opened yet.
   */
  const findAvailableStep =
    useCallback(
      (
        startIndex,
        direction = 1
      ) => {
        let index = startIndex;

        const mobile =
          isMobileViewport();

        while (
          index >= 0 &&
          index < tourSteps.length
        ) {
          const step =
            tourSteps[index];

          const selector =
            getStepSelector(step);

          const element = selector
            ? document.querySelector(
                selector
              )
            : null;

          if (
            element &&
            isElementVisible(element)
          ) {
            return {
              index,
              step,
              element,
            };
          }

          /*
           * The target can appear after the
           * Navbar menu has been opened.
           */
          if (
            mobile &&
            step.requiresMobileMenu
          ) {
            return {
              index,
              step,
              element: null,
            };
          }

          index += direction;
        }

        return null;
      },
      [
        getStepSelector,
        isElementVisible,
        isMobileViewport,
      ]
    );

  /*
   * Smoothly scrolls the selected target into
   * a visible position.
   */
  const scrollToElement =
    useCallback(
      (element) => {
        if (!element) {
          return;
        }

        if (isMobileViewport()) {
          const rect =
            element.getBoundingClientRect();

          const targetAbsoluteTop =
            window.scrollY + rect.top;

          const desiredTop =
            targetAbsoluteTop -
            MOBILE_TOP_MARGIN;

          window.scrollTo({
            top: Math.max(
              desiredTop,
              0
            ),
            behavior: "smooth",
          });

          return;
        }

        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      },
      [isMobileViewport]
    );

  /*
   * Locates, scrolls to and highlights a step
   * after the mobile menu has finished rendering.
   */
  const locateAndHighlightStep =
    useCallback(
      (step) => {
        const selector =
          getStepSelector(step);

        if (!selector) {
          return false;
        }

        const element =
          document.querySelector(
            selector
          );

        if (
          !element ||
          !isElementVisible(element)
        ) {
          console.warn(
            `Adetɔ Boafo: Target not found or hidden for tour step "${step.id}".`
          );

          return false;
        }

        targetElementRef.current =
          element;

        scrollToElement(element);

        window.clearTimeout(
          firstTimerRef.current
        );

        window.clearTimeout(
          secondTimerRef.current
        );

        firstTimerRef.current =
          window.setTimeout(() => {
            calculateRect(element);
          }, 450);

        secondTimerRef.current =
          window.setTimeout(() => {
            calculateRect(element);
          }, 850);

        return true;
      },
      [
        calculateRect,
        getStepSelector,
        isElementVisible,
        scrollToElement,
      ]
    );

  /*
   * Moves between tour steps.
   *
   * On mobile:
   * - opens the hamburger menu for navigation steps;
   * - keeps the menu open between navigation steps;
   * - closes it before returning to normal page steps.
   */
  const moveToStep = useCallback(
    (
      requestedIndex,
      direction = 1
    ) => {
      const available =
        findAvailableStep(
          requestedIndex,
          direction
        );

      if (!available) {
        return false;
      }

      const {
        index,
        step,
        element,
      } = available;

      setStepIndex(index);
      goToStep(index);

      const mobile =
        isMobileViewport();

      const needsMobileMenu =
        mobile &&
        step.requiresMobileMenu;

      window.clearTimeout(
        menuTimerRef.current
      );

      if (needsMobileMenu) {
        toggleMobileMenu(true);

        /*
         * When the menu was already open,
         * the target can be used immediately.
         */
        if (
          element &&
          isElementVisible(element)
        ) {
          locateAndHighlightStep(step);

          return true;
        }

        /*
         * Otherwise wait for React to render
         * the mobile navigation.
         */
        menuTimerRef.current =
          window.setTimeout(() => {
            const located =
              locateAndHighlightStep(
                step
              );

            if (!located) {
              /*
               * A second attempt helps on slower
               * mobile devices and during animation.
               */
              menuTimerRef.current =
                window.setTimeout(() => {
                  locateAndHighlightStep(
                    step
                  );
                }, 220);
            }
          }, 180);

        return true;
      }

      /*
       * Normal page steps should not be hidden
       * behind the expanded mobile navigation.
       */
      if (
        mobile &&
        isMobileMenuOpen()
      ) {
        toggleMobileMenu(false);

        menuTimerRef.current =
          window.setTimeout(() => {
            locateAndHighlightStep(
              step
            );
          }, 180);

        return true;
      }

      locateAndHighlightStep(step);

      return true;
    },
    [
      findAvailableStep,
      goToStep,
      isElementVisible,
      isMobileMenuOpen,
      isMobileViewport,
      locateAndHighlightStep,
      toggleMobileMenu,
    ]
  );

  const completeTour =
    useCallback(() => {
      localStorage.setItem(
        TOUR_COMPLETED_KEY,
        "true"
      );

      if (
        isMobileViewport() &&
        isMobileMenuOpen()
      ) {
        toggleMobileMenu(false);
      }

      setIsActive(false);
      setTargetRect(emptyRect);

      targetElementRef.current = null;

      finishTour();

      window.dispatchEvent(
        new CustomEvent(
          "amoakay:tour-completed",
          {
            detail: {
              language,
            },
          }
        )
      );
    }, [
      finishTour,
      isMobileMenuOpen,
      isMobileViewport,
      language,
      toggleMobileMenu,
    ]);

  const closeTour =
    useCallback(() => {
      if (
        isMobileViewport() &&
        isMobileMenuOpen()
      ) {
        toggleMobileMenu(false);
      }

      setIsActive(false);
      setTargetRect(emptyRect);

      targetElementRef.current = null;

      closeTourContext();

      window.dispatchEvent(
        new CustomEvent(
          "amoakay:tour-closed",
          {
            detail: {
              language,
            },
          }
        )
      );
    }, [
      closeTourContext,
      isMobileMenuOpen,
      isMobileViewport,
      language,
      toggleMobileMenu,
    ]);

  const handleNext =
    useCallback(() => {
      const moved = moveToStep(
        stepIndex + 1,
        1
      );

      if (!moved) {
        completeTour();
      }
    }, [
      completeTour,
      moveToStep,
      stepIndex,
    ]);

  const handlePrevious =
    useCallback(() => {
      moveToStep(
        stepIndex - 1,
        -1
      );
    }, [moveToStep, stepIndex]);

  const handleLanguageChange =
    useCallback(
      (newLanguage) => {
        changeLanguage(newLanguage);

        localStorage.setItem(
          TOUR_LANGUAGE_KEY,
          newLanguage
        );
      },
      [changeLanguage]
    );

  /*
   * Client mounting and saved language.
   */
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

  /*
   * Starts the tour.
   */
  useEffect(() => {
    if (
      !mounted ||
      !tourRunning ||
      isActive
    ) {
      return;
    }

    const firstAvailable =
      findAvailableStep(0, 1);

    if (!firstAvailable) {
      console.warn(
        "Adetɔ Boafo: No elements with matching data-tour attributes were found."
      );

      closeTourContext();

      return;
    }

    localStorage.removeItem(
      TOUR_COMPLETED_KEY
    );

    setIsActive(true);

    const moved = moveToStep(
      firstAvailable.index,
      1
    );

    if (!moved) {
      setIsActive(false);
      closeTourContext();
    }
  }, [
    closeTourContext,
    findAvailableStep,
    isActive,
    mounted,
    moveToStep,
    tourRunning,
  ]);

  /*
   * Recalculate the spotlight while scrolling
   * or resizing the browser.
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const updateViewport = () => {
      setIsMobile(
        window.innerWidth <
          MOBILE_BREAKPOINT
      );

      updateSpotlight();
    };

    updateViewport();

    window.addEventListener(
      "resize",
      updateViewport
    );

    window.addEventListener(
      "scroll",
      updateSpotlight,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateViewport
      );

      window.removeEventListener(
        "scroll",
        updateSpotlight,
        true
      );

      if (
        updateFrameRef.current
      ) {
        cancelAnimationFrame(
          updateFrameRef.current
        );
      }
    };
  }, [
    isActive,
    updateSpotlight,
  ]);

  /*
   * Keyboard controls and page scroll behaviour.
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (event.key === "Escape") {
        closeTour();
      }

      if (
        event.key === "ArrowRight"
      ) {
        handleNext();
      }

      if (
        event.key === "ArrowLeft" &&
        stepIndex > 0
      ) {
        handlePrevious();
      }
    };

    const originalOverflow =
      document.body.style.overflow;

    const originalOverscroll =
      document.body.style
        .overscrollBehavior;

    document.body.style.overscrollBehavior =
      "contain";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      document.body.style.overscrollBehavior =
        originalOverscroll;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    closeTour,
    handleNext,
    handlePrevious,
    isActive,
    stepIndex,
  ]);

  /*
   * Clear delayed operations when TourEngine
   * unmounts.
   */
  useEffect(() => {
    return () => {
      window.clearTimeout(
        firstTimerRef.current
      );

      window.clearTimeout(
        secondTimerRef.current
      );

      window.clearTimeout(
        menuTimerRef.current
      );

      if (
        updateFrameRef.current
      ) {
        cancelAnimationFrame(
          updateFrameRef.current
        );
      }
    };
  }, []);

  if (
    !mounted ||
    !isActive ||
    !currentStep
  ) {
    return null;
  }

  const viewportWidth =
    window.innerWidth;

  const viewportHeight =
    window.innerHeight;

  const spaceBelow =
    viewportHeight -
    targetRect.bottom;

  const spaceAbove =
    targetRect.top;

  const spaceRight =
    viewportWidth -
    targetRect.right;

  const spaceLeft =
    targetRect.left;

  let cardLeft;
  let cardTop;

  if (
    spaceRight >=
    DESKTOP_CARD_WIDTH +
      DESKTOP_CARD_GAP
  ) {
    cardLeft =
      targetRect.right +
      DESKTOP_CARD_GAP;

    cardTop =
      targetRect.top;
  } else if (
    spaceLeft >=
    DESKTOP_CARD_WIDTH +
      DESKTOP_CARD_GAP
  ) {
    cardLeft =
      targetRect.left -
      DESKTOP_CARD_WIDTH -
      DESKTOP_CARD_GAP;

    cardTop =
      targetRect.top;
  } else if (spaceBelow >= 330) {
    cardLeft =
      targetRect.left;

    cardTop =
      targetRect.bottom +
      DESKTOP_CARD_GAP;
  } else {
    cardLeft =
      targetRect.left;

    cardTop =
      targetRect.top -
      330 -
      DESKTOP_CARD_GAP;
  }

  cardLeft = clamp(
    cardLeft,
    VIEWPORT_MARGIN,
    viewportWidth -
      DESKTOP_CARD_WIDTH -
      VIEWPORT_MARGIN
  );

  cardTop = clamp(
    cardTop,
    VIEWPORT_MARGIN,
    viewportHeight - 350
  );

  const cardPosition = {
    left: cardLeft,
    top: cardTop,
    width: DESKTOP_CARD_WIDTH,
  };

  const overlay = (
    <div className="fixed inset-0 z-[10000]">
      {/* Top overlay */}
      <div
        className="adeto-tour-overlay-piece fixed left-0 right-0 top-0 bg-slate-950/72 backdrop-blur-[2px]"
        style={{
          height: `${targetRect.top}px`,
        }}
      />

      {/* Bottom overlay */}
      <div
        className="adeto-tour-overlay-piece fixed bottom-0 left-0 right-0 bg-slate-950/72 backdrop-blur-[2px]"
        style={{
          top: `${targetRect.bottom}px`,
        }}
      />

      {/* Left overlay */}
      <div
        className="adeto-tour-overlay-piece fixed left-0 bg-slate-950/72 backdrop-blur-[2px]"
        style={{
          top: `${targetRect.top}px`,
          width: `${targetRect.left}px`,
          height: `${targetRect.height}px`,
        }}
      />

      {/* Right overlay */}
      <div
        className="adeto-tour-overlay-piece fixed right-0 bg-slate-950/72 backdrop-blur-[2px]"
        style={{
          top: `${targetRect.top}px`,
          left: `${targetRect.right}px`,
          height: `${targetRect.height}px`,
        }}
      />

      {/* Spotlight border */}
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
        mobilePlacement={
          mobileCardPlacement
        }
        onNext={handleNext}
        onPrevious={
          handlePrevious
        }
        onSkip={closeTour}
        onLanguageChange={
          handleLanguageChange
        }
      />
    </div>
  );

  return createPortal(
    overlay,
    document.body
  );
};

export default TourEngine;