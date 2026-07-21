"use client";

const FloatingOrb = ({
  size = "large",
  state = "idle",
}) => {
  const sizeClasses = {
    small: "h-11 w-11",
    medium: "h-16 w-16",
    large: "h-24 w-24 sm:h-28 sm:w-28",
  };

const isThinking = state === "thinking";
const isSpeaking = state === "speaking";
const isListening = state === "listening";

const glowClass =
  isThinking
    ? "adeto-orb-thinking"
    : isSpeaking
      ? "adeto-orb-speaking"
      : isListening
        ? "adeto-orb-listening"
        : "adeto-orb-idle";
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${
        sizeClasses[size] || sizeClasses.large
      }`}
      aria-hidden="true"
    >
      {/* Outer ambient glow */}
      <span
        className={`absolute inset-0 rounded-full bg-green-400/20 blur-xl ${
          glowClass
        }`}
      />

      {/* Rotating outer ring */}
      <span className={`adeto-orb-ring absolute inset-[2px] rounded-full border border-green-300/60 ${
      isThinking ? "adeto-ring-fast" : ""
      }`}
      />

      {/* Secondary ring */}
      <span className="absolute inset-[10%] rounded-full border border-emerald-200/70 bg-white/30 backdrop-blur-md" />

      {/* Main orb */}
      <span className={`adeto-orb-core absolute inset-[20%] overflow-hidden rounded-full bg-gradient-to-br from-lime-300 via-green-500 to-emerald-800 shadow-[0_0_35px_rgba(34,197,94,0.55)] ${
            isSpeaking ? "adeto-core-speaking" : ""
          }`}
       >
        <span className="absolute left-[16%] top-[12%] h-[32%] w-[32%] rounded-full bg-white/70 blur-[2px]" />

        <span className="absolute bottom-[-10%] right-[-5%] h-[58%] w-[58%] rounded-full bg-emerald-950/25 blur-md" />

        <span className="adeto-orb-shine absolute inset-y-0 left-[-70%] w-[50%] rotate-12 bg-gradient-to-r from-transparent via-white/65 to-transparent blur-sm" />
      </span>

      {/* Small activity particles */}
      <span className="adeto-orb-particle adeto-orb-particle-one absolute h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.9)]" />
      <span className="adeto-orb-particle adeto-orb-particle-two absolute h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
      <span className="adeto-orb-particle adeto-orb-particle-three absolute h-1 w-1 rounded-full bg-emerald-300" />
    </div>
  );
};

export default FloatingOrb;