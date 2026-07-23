"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Languages,
  Sparkles,
  X,
} from "lucide-react";

import FloatingOrb from "@/components/ai/FloatingOrb";
import TypingText from "@/components/ai/TypingText";

const TourCard = ({
  step,
  stepIndex,
  totalSteps,
  language,
  position,
  isMobile,
  mobilePlacement,
  onNext,
  onPrevious,
  onSkip,
  onLanguageChange,
}) => {
  if (!step) return null;

  const content = step[language] || step.en;
  const isFirstStep = stepIndex === 0;
  const isFinalStep = stepIndex === totalSteps - 1;

  const labels = {
    en: {
      assistantRole: "AI Shopping Assistant",
      previous: "Back",
      next: "Next",
      finish: "Finish Tour",
      skip: "Skip",
      progress: "Tour progress",
      language: "Language",
    },

    tw: {
      assistantRole: "Wo AI Adetɔ Boafo",
      previous: "San w'akyi",
      next: "Kɔ so",
      finish: "Wie akwankyerɛ no",
      skip: "Twa so",
      progress: "Akwankyerɛ no nkɔso",
      language: "Kasa",
    },
  };

  const text = labels[language] || labels.en;

  const desktopStyle = !isMobile
    ? {
        left: `${position?.left || 0}px`,
        top: `${position?.top || 0}px`,
        width: `${position?.width || 370}px`,
      }
    : undefined;

  const mobilePositionClass =
    mobilePlacement === "top"
      ? "top-0 rounded-b-[28px] border-b"
      : "bottom-0 rounded-t-[28px] border-t";

  return (
    <section
      className={
        isMobile
          ? `
              adeto-tour-card
              adeto-tour-mobile-sheet
              fixed inset-x-0
              z-[10004]
              max-h-[52dvh]
              overflow-y-auto
              border-white/70
              bg-white/95
              px-4
              pb-[max(16px,env(safe-area-inset-bottom))]
              pt-4
              shadow-[0_18px_70px_rgba(15,23,42,0.32)]
              backdrop-blur-2xl
              transition-all
              duration-500
              ease-out
              ${mobilePositionClass}
            `
          : `
              adeto-tour-card
              fixed
              z-[10004]
              rounded-[26px]
              border border-white/70
              bg-white/95
              p-5
              shadow-[0_30px_90px_rgba(15,23,42,0.30)]
              backdrop-blur-2xl
            `
      }
      style={desktopStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adeto-tour-step-title"
    >
      <div
        className={`
          absolute inset-x-0 h-1
          bg-gradient-to-r
          from-lime-400
          via-green-500
          to-emerald-700

          ${
            mobilePlacement === "top"
              ? "bottom-0 rounded-b-[28px]"
              : "top-0 rounded-t-[28px]"
          }
        `}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <FloatingOrb size="small" state="thinking" />

          <div className="min-w-0">
            <p className="truncate text-[15px] font-black tracking-wide text-slate-900">
              Adetɔ Boafo
            </p>

            <p className="text-xs font-medium tracking-wide text-green-700">
              {text.assistantRole}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSkip}
          aria-label={text.skip}
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full
            border border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition

            hover:bg-slate-100
            hover:text-slate-950
          "
        >
          <X size={17} />
        </button>
      </div>

      <div
        className={`
          rounded-[20px]
          border border-slate-200/80
          bg-gradient-to-br
          from-white
          to-slate-50
          shadow-sm

          ${
            isMobile
              ? "mt-4 p-3.5"
              : "mt-5 p-4"
          }
        `}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-green-700">
            <Sparkles size={14} />
          </span>

          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>

        <TypingText
          key={`${language}-${step.id}-title`}
          text={content.title}
          speed={24}
          startDelay={stepIndex === 0 ? 1100 : 120}
          punctuationPause={180}
          thinkingText={
            language === "tw"
              ? "Adetɔ Boafo redwen ho…"
              : "Adetɔ Boafo is thinking…"
          }
          showThinking={stepIndex === 0}
          clickToComplete
          className={
            isMobile
              ? "text-base font-black leading-tight text-slate-950"
              : "text-lg font-black leading-tight text-slate-950"
          }
        />

        <p
          className={
            isMobile
              ? "mt-2.5 text-[13px] leading-5 text-slate-600"
              : "mt-3 text-sm leading-6 text-slate-600"
          }
        >
          {content.message}
        </p>
      </div>

      <div
        className={
          isMobile
            ? "mt-3.5 flex items-center justify-between gap-2"
            : "mt-4 flex items-center justify-between gap-3"
        }
      >
        <div
          className="
            inline-flex
            rounded-full
            border border-slate-200
            bg-slate-100/80
            p-1
            backdrop-blur
          "
          aria-label={text.language}
        >
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
              language === "en"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => onLanguageChange("tw")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
              language === "tw"
                ? "bg-green-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Twi
          </button>
        </div>

        <Languages
          size={16}
          className="shrink-0 text-slate-400"
        />
      </div>

      <div
        className={isMobile ? "mt-4" : "mt-5"}
        role="progressbar"
        aria-label={text.progress}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={stepIndex + 1}
      >
        <div className="flex gap-2">
          {Array.from({
            length: totalSteps,
          }).map((_, index) => (
            <span
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-700 ${
                index <= stepIndex
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div
        className={
          isMobile
            ? "mt-4 flex items-center gap-2"
            : "mt-5 flex items-center gap-3"
        }
      >
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            className="
              flex min-h-11 flex-1
              items-center justify-center gap-2
              rounded-xl
              border border-slate-200
              bg-white
              px-4
              text-sm font-bold
              text-slate-700
              transition

              hover:bg-slate-50
            "
          >
            <ArrowLeft size={16} />
            {text.previous}
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          className="
            group
            flex min-h-11 flex-1
            items-center justify-center gap-2
            rounded-xl
            bg-gradient-to-r
            from-green-600
            to-emerald-700
            px-4
            text-sm font-black
            text-white
            shadow-lg
            shadow-green-200/70
            transition

            hover:-translate-y-0.5
            hover:shadow-xl
          "
        >
          {isFinalStep ? (
            <>
              <Check size={17} />
              {text.finish}
            </>
          ) : (
            <>
              {text.next}

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="
          mt-3
          w-full
          text-center
          text-xs font-semibold
          text-slate-400
          transition

          hover:text-slate-700
        "
      >
        {text.skip}
      </button>
    </section>
  );
};

export default TourCard;