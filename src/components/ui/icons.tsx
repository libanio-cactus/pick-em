import type { SVGProps } from "react";

const I = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const TrophyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="M6 4h12v4a6 6 0 0 1-12 0V4Z" />
    <path d="M6 6H4a2 2 0 0 0 0 4h2M18 6h2a2 2 0 0 1 0 4h-2M9 16h6M10 20h4M12 14v2" />
  </svg>
);

export const BallIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 7 3 2-1 3.5h-4L9 9l3-2ZM9 9 4.5 9.5M15 9l4.5.5M10 12.5 7.5 16m6-3.5L16.5 16M8 18.5l1.5-2.5m6.5 2.5-1.5-2.5" />
  </svg>
);

export const ChartIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="M3 3v18h18" />
    <path d="m7 14 3-4 3 2 4-6" />
  </svg>
);

export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
    <circle cx="9" cy="7" r="3" />
    <path d="M22 19v-1a4 4 0 0 0-3-3.87M16 4.13A4 4 0 0 1 16 11.6" />
  </svg>
);

export const FlagIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="M4 21V4M4 4h11l-1.5 4L15 12H4" />
  </svg>
);

export const FireIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="M12 3c.5 3-2 4-2 7a2 2 0 0 0 4 0c0-1 1-1.5 1-3 1.5 1.2 3 3.3 3 6a6 6 0 1 1-12 0c0-4 3-6 4-10 1.5.5 3 .5 4 0Z" />
  </svg>
);

export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);

export const CopyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const WalletIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
    <path d="M16 13h.01" />
  </svg>
);

export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
