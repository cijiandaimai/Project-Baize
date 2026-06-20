import { motion } from "motion/react";
import { type BaizeMood } from "../types";

interface BaizePetProps {
  mood: BaizeMood;
  level: number;
  onClick?: () => void;
  isFloating?: boolean;
}

export default function BaizePet({ mood, level, onClick, isFloating = false }: BaizePetProps) {
  // Determine accessories or characteristics based on Level (Evolution)
  // Lv 1: 小白泽 (Basic)
  // Lv 10: 灵明白泽 (Crown/glow aura)
  // Lv 20: 通慧白泽 (Fluffy cloud wings!)
  // Lv 30+: 全知瑞兽 (Golden halo, larger golden horn)
  const hasWings = level >= 20;
  const hasAura = level >= 10;
  const hasGoldenHalo = level >= 30;

  // Render SVG details dynamically based on mood
  const renderFace = () => {
    switch (mood) {
      case "happy":
        return (
          <>
            {/* Happy curved eyes */}
            <path d="M28 42 Q33 36 38 42" stroke="#5c4d3c" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M62 42 Q67 36 72 42" stroke="#5c4d3c" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Extremely happy curved open mouth */}
            <path d="M44 50 Q50 62 56 50 Z" fill="#e25c5c" stroke="#5c4d3c" strokeWidth="2" />
            {/* Cute pink blushes */}
            <ellipse cx="24" cy="46" rx="5" ry="3" fill="#ffb3ba" opacity="0.8" />
            <ellipse cx="76" cy="46" rx="5" ry="3" fill="#ffb3ba" opacity="0.8" />
          </>
        );
      case "thinking":
        return (
          <>
            {/* Curious wide eyes with smaller pupils */}
            <circle cx="33" cy="42" r="5" fill="#4d3b2b" />
            <circle cx="67" cy="42" r="5" fill="#4d3b2b" />
            <ellipse cx="32" cy="40" rx="1.5" ry="1.5" fill="white" />
            <ellipse cx="66" cy="40" rx="1.5" ry="1.5" fill="white" />
            {/* Curved thinking eyebrows */}
            <path d="M26 34 Q33 30 38 36" stroke="#4d3b2b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M62 36 Q67 30 74 34" stroke="#4d3b2b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Small simple neutral line mouth */}
            <path d="M46 52 Q50 51 54 52" stroke="#5c4d3c" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );
      case "sleeping":
        return (
          <>
            {/* Closed Zzz linear eyes */}
            <path d="M28 44 L38 44" stroke="#4d3b2b" strokeWidth="3" strokeLinecap="round" />
            <path d="M62 44 L72 44" stroke="#4d3b2b" strokeWidth="3" strokeLinecap="round" />
            {/* Cute small bubble-o mouth */}
            <circle cx="50" cy="52" r="2.5" fill="#5c4d3c" />
            {/* Tiny spit bubble */}
            <motion.circle
              cx="55"
              cy="48"
              r="2"
              fill="#e0f2fe"
              opacity="0.8"
              animate={{ r: [2, 4, 2], opacity: [0.6, 0.9, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </>
        );
      case "surprised":
        return (
          <>
            {/* Wide spherical eyes */}
            <circle cx="33" cy="42" r="7" fill="#4d3b2b" />
            <circle cx="67" cy="42" r="7" fill="#4d3b2b" />
            <circle cx="31" cy="40" r="2" fill="white" />
            <circle cx="65" cy="40" r="2" fill="white" />
            {/* Highly elevated circular mouth */}
            <ellipse cx="50" cy="52" rx="4" ry="6" fill="#4d3b2b" />
            <ellipse cx="25" cy="48" rx="4" ry="2.5" fill="#ffb3ba" opacity="0.8" />
            <ellipse cx="75" cy="48" rx="4" ry="2.5" fill="#ffb3ba" opacity="0.8" />
          </>
        );
      case "sad":
        return (
          <>
            {/* Tearful eyes downwards */}
            <path d="M28 42 Q33 46 38 42" stroke="#4d3b2b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M62 42 Q67 46 72 42" stroke="#4d3b2b" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Inverted frown mouth */}
            <path d="M45 54 Q50 49 55 54" stroke="#5c4d3c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Cute tears */}
            <motion.path
              d="M32 45 L32 52"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </>
        );
      case "talking":
        return (
          <>
            {/* Normal sparkling eyes */}
            <circle cx="33" cy="42" r="6" fill="#5c4d3c" />
            <circle cx="67" cy="42" r="6" fill="#5c4d3c" />
            <circle cx="31" cy="39" r="2.5" fill="white" />
            <circle cx="65" cy="39" r="2.5" fill="white" />
            {/* Animated talking mouth */}
            <motion.ellipse
              cx="50"
              cy="51"
              rx="4.5"
              ry="3"
              fill="#e25c5c"
              stroke="#5c4d3c"
              strokeWidth="1.5"
              animate={{ ry: [1.5, 4.5, 1.5] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            />
          </>
        );
      case "reading":
        return (
          <>
            {/* Serious downward studious squint */}
            <path d="M30 42 A 5 5 0 0 0 40 42" stroke="#4d3b2b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M60 42 A 5 5 0 0 0 70 42" stroke="#4d3b2b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M46 51 Q50 52 54 51" stroke="#5c4d3c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        );
      case "writing":
        return (
          <>
            {/* Smiling squinted content lines */}
            <path d="M28 40 L36 43" stroke="#4d3b2b" strokeWidth="3" strokeLinecap="round" />
            <path d="M72 40 L64 43" stroke="#4d3b2b" strokeWidth="3" strokeLinecap="round" />
            <path d="M47 50 Q50 53 53 50" fill="none" stroke="#5c4d3c" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="25" cy="45" rx="3" ry="1.5" fill="#ffb3ba" />
            <ellipse cx="75" cy="45" rx="3" ry="1.5" fill="#ffb3ba" />
          </>
        );
      case "idle":
      default:
        return (
          <>
            {/* Cute big shiny Amber pupils */}
            <circle cx="33" cy="42" r="6" fill="#5c4d3c" />
            <circle cx="67" cy="42" r="6" fill="#5c4d3c" />
            {/* Sparkling stars / high-lights inside eyes */}
            <circle cx="31" cy="39" r="2.2" fill="white" />
            <circle cx="65" cy="39" r="2.2" fill="white" />
            <circle cx="35" cy="45" r="1.1" fill="white" />
            <circle cx="69" cy="45" r="1.1" fill="white" />
            {/* Gentle smile mouth */}
            <path d="M45 50 Q50 54 55 50" stroke="#5c4d3c" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative select-none ${onClick ? "cursor-pointer active:scale-95 transition-transform" : ""}`}
      style={{ width: isFloating ? "90px" : "150px", height: isFloating ? "90px" : "150px" }}
    >
      {/* Halo Effect for high levels */}
      {hasGoldenHalo && (
        <motion.div
          className="absolute rounded-full border border-yellow-300 bg-yellow-200/20 shadow-[0_0_15px_rgba(253,224,71,0.5)]"
          style={{
            width: isFloating ? "60px" : "100px",
            height: isFloating ? "18px" : "28px",
            left: isFloating ? "15px" : "25px",
            top: isFloating ? "-5px" : "-10px",
          }}
          animate={{ y: [-2, 2, -2], rotateX: [70, 70, 70] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
      )}

      {/* Glow Aura effect for Level 10 onwards */}
      {hasAura && (
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-300/10 filter blur-[15px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        />
      )}

      {/* Main Baize Body Body Frame */}
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
        animate={mood === "sleeping" ? { y: [0, -2, 0] } : { y: [-3, 3, -3] }}
        transition={{
          repeat: Infinity,
          duration: mood === "sleeping" ? 3 : 2.5,
          ease: "easeInOut",
        }}
      >
        {/* WINGS (Lv 20+) */}
        {hasWings && (
          <>
            {/* Left wing */}
            <motion.path
              d="M20 55 C5 50 -2 30 10 25 C18 21 24 35 25 45 Z"
              fill="url(#wingGradient)"
              opacity="0.85"
              style={{ originX: "25px", originY: "45px" }}
              animate={mood === "sleeping" ? { rotate: [0, 4, 0] } : { rotate: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
            {/* Right wing */}
            <motion.path
              d="M80 55 C95 50 102 30 90 25 C82 21 76 35 75 45 Z"
              fill="url(#wingGradient)"
              opacity="0.85"
              style={{ originX: "75px", originY: "45px" }}
              animate={mood === "sleeping" ? { rotate: [0, -4, 0] } : { rotate: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </>
        )}

        {/* Fluffy tail */}
        <motion.path
          d="M15 70 C 2 75 -5 60 5 50 C 12 42 22 55 18 64 Z"
          fill="url(#fluffyGradient)"
          style={{ originX: "18px", originY: "64px" }}
          animate={{ rotate: mood === "happy" ? [-10, 25, -10] : [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: mood === "happy" ? 0.6 : 2 }}
        />

        {/* Head fluffy hair background */}
        <ellipse cx="50" cy="74" rx="28" ry="18" fill="#f1f5f9" />

        {/* Fluffy ears */}
        {/* Left ear */}
        <motion.path
          d="M 28 35 C 10 30 18 10 28 20 Z"
          fill="#f1f5f9"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          style={{ originX: "28px", originY: "20px" }}
          animate={{ rotate: mood === "sad" ? [-15, -10, -15] : mood === "surprised" ? [10, 15, 10] : [-2, 2, -2] }}
          transition={{ duration: 1 }}
        />
        {/* Left inner ear */}
        <path d="M 27 31 C 18 28 22 17 26 22 Z" fill="#ffe4e6" />

        {/* Right ear */}
        <motion.path
          d="M 72 35 C 90 30 82 10 72 20 Z"
          fill="#f1f5f9"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          style={{ originX: "72px", originY: "20px" }}
          animate={{ rotate: mood === "sad" ? [15, 10, 15] : mood === "surprised" ? [-10, -15, -10] : [2, -2, 2] }}
          transition={{ duration: 1 }}
        />
        {/* Right inner ear */}
        <path d="M 73 31 C 82 28 78 17 74 22 Z" fill="#ffe4e6" />

        {/* Body trunk */}
        <circle cx="50" cy="68" r="22" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {/* Collar & bamboo slip scroll accessory on neck */}
        <rect x="42" y="72" width="16" height="5" rx="2.5" fill="#38bdf8" />
        <circle cx="50" cy="79" r="3" fill="#facc15" />

        {/* Head orb */}
        <circle cx="50" cy="45" r="30" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2.5" />

        {/* Hair Tuft/Mane Forehead */}
        <path d="M40 18 C 45 15 50 10 52 18 C 55 10 60 15 58 20 C 53 22 47 22 40 18 Z" fill="#e0f2fe" />

        {/* UNICORN (金色独角) */}
        <motion.polygon
          points="50,4 45,18 55,18"
          fill={level >= 30 ? "url(#superHorn)" : "#facc15"}
          stroke="#d97706"
          strokeWidth="1"
          animate={mood === "thinking" ? { scaleY: [1, 1.12, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        {/* Horn rings */}
        <path d="M 47 13 Q 50 14 53 13" stroke="#d97706" strokeWidth="1" />
        <path d="M 46 9 Q 50 10 54 9" stroke="#d97706" strokeWidth="1" />

        {/* Facial Details Render */}
        {renderFace()}

        {/* Interactive action items based on mood */}
        {mood === "reading" && (
          <g>
            {/* Draw a cute ancient book/bamboo slip */}
            <rect x="35" y="58" width="30" height="15" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <path d="M 40 60 L 40 71 M 45 60 L 45 71 M 50 60 L 50 71 M 55 60 L 55 71 M 60 60 L 60 71" stroke="#ca8a04" strokeWidth="1" />
            {/* Character text icons inside */}
            <path d="M 41 62 H 44 M 46 65 H 49 M 51 63 H 54 M 56 66 H 59" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {mood === "writing" && (
          <g>
            {/* Draw a tiny pencil or brush */}
            <line x1="68" y1="50" x2="78" y2="36" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
            <polygon points="68,50 67,46 71,49" fill="#000000" />
            {/* Paper scroll */}
            <rect x="25" y="60" width="28" height="16" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 28 64 H 42 M 28 68 H 48 M 28 72 H 38" stroke="#cbd5e1" strokeWidth="1" />
          </g>
        )}

        {/* Gradients definitions */}
        <defs>
          <linearGradient id="fluffyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="superHorn" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
