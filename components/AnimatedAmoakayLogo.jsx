"use client";

import { Protect } from "@clerk/nextjs";
import Link from "next/link";

const AnimatedAmoakayLogo = () => {
  return (
    <Link
      href="/"
      aria-label="Amoakay Deals homepage"
      className="amoakay-brand group relative inline-flex shrink-0 items-center pr-8 sm:pr-10"
    >
      <svg
        viewBox="0 0 620 170"
        role="img"
        aria-labelledby="amoakay-logo-title amoakay-logo-description"
        className="h-auto w-[205px] overflow-visible sm:w-[245px] 2xl:w-[275px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="amoakay-logo-title">Amoakay Deals</title>

        <desc id="amoakay-logo-description">
          Amoakay Deals technology marketplace logo with the slogan Dwa papa
          fie
        </desc>

        <defs>
          {/* Main green gradient */}
          <linearGradient
            id="amoakayGreenGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="42%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Dark section of the A */}
          <linearGradient
            id="amoakayDarkGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Wordmark gradient */}
          <linearGradient
            id="amoakayWordGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="55%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Deals gradient */}
          <linearGradient
            id="amoakayDealsGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Moving shine */}
          <linearGradient
            id="amoakayShineGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="45%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.9" />
            <stop offset="55%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Soft logo glow */}
          <filter
            id="amoakaySoftGlow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                0 0 0 0 0.13
                0 0 0 0 0.77
                0 0 0 0 0.37
                0 0 0 0.35 0
              "
              result="greenBlur"
            />
            <feMerge>
              <feMergeNode in="greenBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip for the shine passing over the complete logo */}
          <clipPath id="amoakayLogoClip">
            <rect x="0" y="0" width="620" height="170" rx="16" />
          </clipPath>
        </defs>

       

        {/* ======================================================
            CUSTOM A SYMBOL
        ====================================================== */}
        <g
          className="amoakay-symbol"
          filter="url(#amoakaySoftGlow)"
          transform="translate(18 13)"
        >
          {/* Dark rear stroke */}
          <path
            className="amoakay-symbol-dark"
            d="M86 11C94 11 101 16 104 24L154 142C158 151 151 160 141 160H117C110 160 104 156 101 149L63 58L41 109L11 137L67 22C71 15 78 11 86 11Z"
            fill="url(#amoakayDarkGradient)"
          />

          {/* Green front stroke */}
          <path
            className="amoakay-symbol-green"
            d="M75 10C83 10 90 16 93 23L111 64L88 87L69 45L14 154C10 162 0 165 -7 160C-13 156 -15 147 -11 140L54 22C58 14 66 10 75 10Z"
            fill="url(#amoakayGreenGradient)"
          />

          {/* Forward marketplace swoosh */}
          <path
            className="amoakay-swoosh amoakay-swoosh-main"
            d="M-3 151C34 116 78 100 150 101C105 108 64 129 29 159C20 167 5 165 -3 157C-5 155 -5 153 -3 151Z"
            fill="url(#amoakayGreenGradient)"
          />

          {/* Lower secondary swoosh */}
          <path
            className="amoakay-swoosh amoakay-swoosh-secondary"
            d="M29 159C67 137 104 127 143 128C104 137 76 151 50 168C42 173 33 170 29 163Z"
            fill="#047857"
            opacity="0.95"
          />
        </g>

        {/* ======================================================
            WORDMARK
        ====================================================== */}
        <g className="amoakay-wordmark">
          <text
            x="187"
            y="79"
            fill="url(#amoakayWordGradient)"
            fontSize="62"
            fontWeight="900"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="-3"
          >
            Amoakay
          </text>

          <text
            x="247"
            y="133"
            fill="url(#amoakayDealsGradient)"
            fontSize="56"
            fontWeight="800"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="-2"
          >
            Deals
          </text>

          {/* Brand dot */}
          <circle
            className="amoakay-brand-dot"
            cx="361"
            cy="122"
            r="7"
            fill="#16a34a"
          />
        </g>

        {/* ======================================================
            UNDERLINE AND TWI SLOGAN
        ====================================================== */}
        <g className="amoakay-tagline-area">
          <path
            className="amoakay-logo-line"
            d="M181 143H466"
            fill="none"
            stroke="url(#amoakayGreenGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <circle
            className="amoakay-line-spark"
            cx="450"
            cy="143"
            r="4"
            fill="#bef264"
          />

          <text
            className="amoakay-tagline"
            x="324"
            y="163"
            textAnchor="middle"
            fill="#166534"
            fontSize="16"
            fontWeight="700"
            fontStyle="italic"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="4"
          >
            Dwa papa fie!
          </text>
        </g>

        {/* ======================================================
            REPEATING PREMIUM SHINE
        ====================================================== */}
        <g clipPath="url(#amoakayLogoClip)">
          <rect
            className="amoakay-premium-shine"
            x="-220"
            y="-25"
            width="190"
            height="220"
            fill="url(#amoakayShineGradient)"
            transform="skewX(-18)"
          />
        </g>
      </svg>

      {/* Soft hover glow behind the SVG */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-green-400/0 blur-2xl transition duration-500 group-hover:bg-green-400/15"
      />

      {/* Existing Clerk Plus badge */}
      <Protect plan="plus">
        <span className="amoakay-plus-badge absolute right-0 top-[-7px] rounded-full bg-gradient-to-r from-green-600 to-emerald-500 px-2.5 py-1 text-[9px] font-extrabold lowercase tracking-wide text-white shadow-md shadow-green-200 sm:text-[10px]">
          plus
        </span>
      </Protect>
    </Link>
  );
};

export default AnimatedAmoakayLogo;