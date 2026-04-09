/**
 * 이미지 참고: 흰/회백 배경 + 파란 잉크 선화 꽃 (lily of the valley / 은방울꽃 스타일)
 * stroke 색 = #2A4A7F (딥 블루 잉크)
 * 모두 aria-hidden, pointer-events-none
 */

const INK = "#2A4A7F";

export function BotanicalCornerTR({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none ${className}`}
    >
      {/* Main stem */}
      <path d="M240 10 C210 60 175 90 140 140 C110 180 80 220 40 300" stroke={INK} strokeWidth="0.9" strokeLinecap="round"/>
      {/* Left branch */}
      <path d="M185 70 C160 52 135 58 115 46" stroke={INK} strokeWidth="0.75" strokeLinecap="round"/>
      {/* Right branch */}
      <path d="M158 108 C178 88 198 84 215 68" stroke={INK} strokeWidth="0.75" strokeLinecap="round"/>
      {/* Branch lower */}
      <path d="M120 158 C100 138 78 138 62 150" stroke={INK} strokeWidth="0.7" strokeLinecap="round"/>

      {/* Bell flowers — left cluster */}
      <path d="M113 43 C108 36 102 34 98 38 C94 42 95 50 100 54 C105 58 112 56 113 50 Z" stroke={INK} strokeWidth="0.7" fill="none"/>
      <path d="M104 42 C99 35 93 33 89 37 C85 41 86 49 91 53 C96 57 103 55 104 49 Z" stroke={INK} strokeWidth="0.7" fill="none"/>
      <path d="M122 38 C117 31 111 29 107 33 C103 37 104 45 109 49 C114 53 121 51 122 45 Z" stroke={INK} strokeWidth="0.65" fill="none"/>

      {/* Bell flowers — right cluster */}
      <path d="M217 65 C212 58 206 56 202 60 C198 64 199 72 204 76 C209 80 216 78 217 72 Z" stroke={INK} strokeWidth="0.7" fill="none"/>
      <path d="M226 56 C221 49 215 47 211 51 C207 55 208 63 213 67 C218 71 225 69 226 63 Z" stroke={INK} strokeWidth="0.65" fill="none"/>

      {/* Leaves */}
      <path d="M140 140 C130 122 118 118 108 126" stroke={INK} strokeWidth="0.65" strokeLinecap="round"/>
      <path d="M140 140 C152 126 165 126 168 138" stroke={INK} strokeWidth="0.65" strokeLinecap="round"/>
      <path d="M95 195 C82 178 68 178 60 188" stroke={INK} strokeWidth="0.6" strokeLinecap="round"/>
      <path d="M95 195 C108 180 122 182 124 196" stroke={INK} strokeWidth="0.6" strokeLinecap="round"/>
      <path d="M62 148 C50 136 38 138 32 148" stroke={INK} strokeWidth="0.6" strokeLinecap="round"/>

      {/* Tiny buds */}
      <ellipse cx="130" cy="50" rx="3" ry="4.5" stroke={INK} strokeWidth="0.6" transform="rotate(-25 130 50)"/>
      <ellipse cx="60" cy="148" rx="2.5" ry="4" stroke={INK} strokeWidth="0.6" transform="rotate(10 60 148)"/>
      <ellipse cx="50" cy="285" rx="2.5" ry="4" stroke={INK} strokeWidth="0.6"/>

      {/* Dot accents */}
      <circle cx="100" cy="57" r="1.2" fill={INK} opacity="0.5"/>
      <circle cx="205" cy="79" r="1" fill={INK} opacity="0.5"/>
      <circle cx="125" cy="198" r="1" fill={INK} opacity="0.4"/>
    </svg>
  );
}

export function BotanicalCornerBL({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none ${className}`}
      style={{ transform: "rotate(180deg)" }}
    >
      <path d="M240 10 C210 60 175 90 140 140 C110 180 80 220 40 300" stroke={INK} strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M185 70 C160 52 135 58 115 46" stroke={INK} strokeWidth="0.75" strokeLinecap="round"/>
      <path d="M158 108 C178 88 198 84 215 68" stroke={INK} strokeWidth="0.75" strokeLinecap="round"/>
      <path d="M113 43 C108 36 102 34 98 38 C94 42 95 50 100 54 C105 58 112 56 113 50 Z" stroke={INK} strokeWidth="0.7" fill="none"/>
      <path d="M104 42 C99 35 93 33 89 37 C85 41 86 49 91 53 C96 57 103 55 104 49 Z" stroke={INK} strokeWidth="0.7" fill="none"/>
      <path d="M217 65 C212 58 206 56 202 60 C198 64 199 72 204 76 C209 80 216 78 217 72 Z" stroke={INK} strokeWidth="0.7" fill="none"/>
      <path d="M140 140 C130 122 118 118 108 126" stroke={INK} strokeWidth="0.65" strokeLinecap="round"/>
      <path d="M140 140 C152 126 165 126 168 138" stroke={INK} strokeWidth="0.65" strokeLinecap="round"/>
      <ellipse cx="130" cy="50" rx="3" ry="4.5" stroke={INK} strokeWidth="0.6" transform="rotate(-25 130 50)"/>
      <circle cx="100" cy="57" r="1.2" fill={INK} opacity="0.5"/>
    </svg>
  );
}
