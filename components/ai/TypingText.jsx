"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TypingText = ({
  text = "",
  speed = 22,
  startDelay = 900,
  punctuationPause = 180,
  className = "",
  thinkingText = "Adetɔ Boafo is thinking…",
  showThinking = true,
  showCursor = true,
  clickToComplete = true,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isThinking, setIsThinking] = useState(showThinking);
  const [isComplete, setIsComplete] = useState(false);

  const typingTimerRef = useRef(null);
  const delayTimerRef = useRef(null);
  const currentIndexRef = useRef(0);
  const completedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (delayTimerRef.current) {
      window.clearTimeout(delayTimerRef.current);
    }

    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }
  }, []);

  const completeTyping = useCallback(() => {
    clearTimers();

    currentIndexRef.current = text.length;
    setDisplayedText(text);
    setIsThinking(false);
    setIsComplete(true);

    if (!completedRef.current) {
      completedRef.current = true;

      if (typeof onComplete === "function") {
        onComplete();
      }
    }
  }, [clearTimers, onComplete, text]);

  useEffect(() => {
    clearTimers();

    currentIndexRef.current = 0;
    completedRef.current = false;

    setDisplayedText("");
    setIsComplete(false);
    setIsThinking(showThinking);

    if (!text) {
      setIsThinking(false);
      setIsComplete(true);
      return;
    }

    const typeNextCharacter = () => {
      currentIndexRef.current += 1;

      const nextText = text.slice(0, currentIndexRef.current);
      const currentCharacter = text[currentIndexRef.current - 1];

      setDisplayedText(nextText);

      if (currentIndexRef.current >= text.length) {
        setIsComplete(true);

        if (!completedRef.current) {
          completedRef.current = true;

          if (typeof onComplete === "function") {
            onComplete();
          }
        }

        return;
      }

      let nextDelay = speed;

      if ([".", "!", "?"].includes(currentCharacter)) {
        nextDelay += punctuationPause;
      } else if ([",", ";", ":"].includes(currentCharacter)) {
        nextDelay += punctuationPause * 0.55;
      } else {
        nextDelay += Math.floor(Math.random() * 18);
      }

      typingTimerRef.current = window.setTimeout(
        typeNextCharacter,
        nextDelay,
      );
    };

   const thinkingDelay =
   text.length < 30
    ? Math.max(startDelay, 1100)
    : text.length < 60
      ? Math.max(startDelay, 900)
      : Math.max(startDelay, 700);

delayTimerRef.current = window.setTimeout(() => {
  setIsThinking(false);
  typeNextCharacter();
}, thinkingDelay);

    return clearTimers;
  }, [
    text,
    speed,
    startDelay,
    punctuationPause,
    showThinking,
    onComplete,
    clearTimers,
  ]);

  const handleClick = () => {
    if (clickToComplete && !isComplete) {
      completeTyping();
    }
  };

  return (
    <p
      className={`${className} ${
        clickToComplete && !isComplete
          ? "cursor-pointer"
          : ""
      }`}
      onClick={handleClick}
      title={
        clickToComplete && !isComplete
          ? "Click to show the complete text"
          : undefined
      }
    >
      {isThinking ? (
        <span className="inline-flex items-center gap-2 text-slate-500">
          <span>{thinkingText}</span>

          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1"
          >
            <span className="adeto-thinking-dot h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="adeto-thinking-dot h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="adeto-thinking-dot h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
        </span>
      ) : (
        <>
          {displayedText}

          {showCursor && !isComplete && (
            <span
              aria-hidden="true"
              className="adeto-typing-cursor ml-1 inline-block h-[1em] w-[2px] bg-green-600 align-middle"
            />
          )}
        </>
      )}
    </p>
  );
};

export default TypingText;