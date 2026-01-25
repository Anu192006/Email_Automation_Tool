/**
 * Logo Component
 * Reusable, scalable SVG logo for the Email Automation Platform
 * Used across Login, Sidebar, and Header
 */
export const Logo = ({ size = 'md', variant = 'icon' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
  }

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 20

  return (
    <svg
      className={`${sizeClasses[size]} flex-shrink-0`}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Email Automation Platform Logo"
      title="Email Automation Platform"
    >
      {/* Background circle */}
      <rect width="40" height="40" rx="8" fill="#2563eb" />

      {/* Envelope icon */}
      <path
        d="M10 14C10 13.4477 10.4477 13 11 13H29C29.5523 13 30 13.4477 30 14V26C30 26.5523 29.5523 27 29 27H11C10.4477 27 10 26.5523 10 26V14Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Envelope flap */}
      <path
        d="M10 14L20 21L30 14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Automation spark - small gear-like element */}
      <circle cx="25" cy="10" r="2.5" fill="white" opacity="0.8" />
    </svg>
  )
}
