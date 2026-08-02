"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

function calculateTimeRemaining(endTime) {
  const difference =
    new Date(endTime).getTime() - Date.now();

  if (difference <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    expired: false,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function TimeBox({ value, label }) {
  return (
    <div className="min-w-[46px] bg-slate-900 px-2 py-2 text-center text-white">
      <p className="text-sm font-black leading-none">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-300">
        {label}
      </p>
    </div>
  );
}

export default function FlashCountdown({
  endsAt,
  onExpired,
  compact = false,
}) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    calculateTimeRemaining(endsAt)
  );
  const { t } = useLanguage();  
  useEffect(() => {
    const updateCountdown = () => {
      const nextTime = calculateTimeRemaining(endsAt);

      setTimeRemaining(nextTime);

      if (nextTime.expired && onExpired) {
        onExpired();
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onExpired]);

  if (timeRemaining.expired) {
    return (
      <span className="inline-flex bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
        {t("product.dealEndsIn")}
      </span>
    );
  }

 if (compact) {
  return (
    <div className="flex items-center gap-1">
      {timeRemaining.days > 0 && (
        <>
          <TimeBox
            value={timeRemaining.days}
            label={t("product.days")}
          />

          <span className="font-black text-slate-400">
            :
          </span>
        </>
      )}

      <TimeBox
        value={timeRemaining.hours}
        label={t("product.hrs")}
      />

      <span className="font-black text-slate-400">
        :
      </span>

      <TimeBox
        value={timeRemaining.minutes}
        label={t("product.min")}
      />

      <span className="font-black text-slate-400">
        :
      </span>

      <TimeBox
        value={timeRemaining.seconds}
        label={t("product.sec")}
      />
    </div>
  );
}

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        Deal ends in
      </p>

      <div className="flex items-center gap-1">
        {timeRemaining.days > 0 && (
          <>
            <TimeBox
              value={timeRemaining.days}
              label="Days"
            />

            <span className="font-black text-slate-400">
              :
            </span>
          </>
        )}

        <TimeBox
          value={timeRemaining.hours}
          label="Hours"
        />

        <span className="font-black text-slate-400">:</span>

        <TimeBox
          value={timeRemaining.minutes}
          label={t("product.minutes")}
        />

        <span className="font-black text-slate-400">:</span>

        <TimeBox
          value={timeRemaining.seconds}
          label={t("product.seconds")}
        />
      </div>
    </div>
  );
}