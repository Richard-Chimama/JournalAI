import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L12 22M12 2L6 8M12 2L18 8" />
      <circle cx="12" cy="12" r="3" stroke="hsl(var(--accent))" strokeWidth="2.5" fill="hsl(var(--accent)/0.3)" />
      <path d="M18 12L22 12M2 12L6 12" />
      <path d="M12 18L8 22M12 18L16 22" />
    </svg>
  );
}
