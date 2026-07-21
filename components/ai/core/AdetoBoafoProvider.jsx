 "use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import AdetoBoafoContext from "./AdetoBoafoContext";

const DEFAULT_LANGUAGE = "en";

export default function AdetoBoafoProvider({ children }) {
  const [language, setLanguage] =
    useState(DEFAULT_LANGUAGE);

  const [assistantOpen, setAssistantOpen] =
    useState(false);

  const [tourRunning, setTourRunning] =
    useState(false);

  const [currentStep, setCurrentStep] =
    useState(0);

  const changeLanguage = useCallback((newLanguage) => {
    if (newLanguage !== "en" && newLanguage !== "tw") {
      return;
    }

    setLanguage(newLanguage);
  }, []);

  const openAssistant = useCallback(() => {
    setAssistantOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setAssistantOpen(false);
  }, []);

  const startTour = useCallback((step = 0) => {
    setCurrentStep(step);
    setTourRunning(true);
  }, []);

  const finishTour = useCallback(() => {
    setTourRunning(false);
    setCurrentStep(0);
  }, []);

  const closeTour = useCallback(() => {
    setTourRunning(false);
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  const value = useMemo(
    () => ({
      language,
      changeLanguage,

      assistantOpen,
      openAssistant,
      closeAssistant,

      tourRunning,
      currentStep,
      startTour,
      finishTour,
      closeTour,
      goToStep,
    }),
    [
      language,
      changeLanguage,
      assistantOpen,
      openAssistant,
      closeAssistant,
      tourRunning,
      currentStep,
      startTour,
      finishTour,
      closeTour,
      goToStep,
    ],
  );

  return (
    <AdetoBoafoContext.Provider value={value}>
      {children}
    </AdetoBoafoContext.Provider>
  );
}