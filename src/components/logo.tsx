import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M4 4h16v16H4z" fill="hsl(var(--primary))" stroke="none" />
    <path d="M9 9h6v10H9z" fill="hsl(var(--background))" stroke="none" />
    <path d="M9 9v10" stroke="hsl(var(--primary))" strokeWidth="2" />
  </svg>
);

export default Logo;
