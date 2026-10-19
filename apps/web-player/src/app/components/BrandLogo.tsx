import React from 'react';

/**
 * Original compact Western wordmark for the player dashboard.
 * The approved cinematic homepage artwork remains unchanged.
 */
export default function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 460 160"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="whiskey-bent-brand-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="whiskey-bent-brand-title">Whiskey Bent Social Casino</title>
      <defs>
        <linearGradient id="wb-brass" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#f9d99b" />
          <stop offset="45%" stopColor="#dc9f46" />
          <stop offset="100%" stopColor="#996122" />
        </linearGradient>
      </defs>
      {/* Weathered western scrollwork and cowboy hat. */}
      <g stroke="url(#wb-brass)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M20 48 Q74 7 150 29 M23 49 Q52 37 63 47 Q73 55 61 60 M36 43 Q29 28 42 29" />
        <path d="M440 48 Q386 7 310 29 M437 49 Q408 37 397 47 Q387 55 399 60 M424 43 Q431 28 418 29" />
        <path d="M74 23 Q112 20 140 29 M386 23 Q348 20 320 29" strokeWidth="1" />
      </g>
      <g fill="url(#wb-brass)" stroke="#613a1c" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M202 23 Q201 12 208 7 Q230 -1 251 7 Q259 12 259 23 L264 45 Q230 57 196 45 Z" />
        <path d="M190 42 Q230 55 270 42 L279 50 Q266 63 230 63 Q194 63 181 50 Z" />
        <path d="M201 37 Q230 45 260 37 L262 44 Q230 53 198 44 Z" fill="#392015" stroke="none" />
      </g>
      <text
        x="230"
        y="113"
        fill="url(#wb-brass)"
        stroke="#5f3515"
        strokeWidth="0.9"
        paintOrder="stroke"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="900"
        fontSize="47"
        letterSpacing="-1.3"
        textAnchor="middle"
      >
        WHISKEY BENT
      </text>
      <path d="M83 141 H158 M302 141 H377" stroke="#bd8540" strokeWidth="1.5" />
      <path d="M77 141 l6 -3 v6 Z M383 141 l-6 -3 v6 Z" fill="#bd8540" />
      <text
        x="230"
        y="147"
        fill="#deb470"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="18"
        letterSpacing="3.5"
        textAnchor="middle"
      >
        SOCIAL CASINO
      </text>
    </svg>
  );
}
