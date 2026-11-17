import type { ReactNode } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function Icon({
  size = 20,
  className,
  strokeWidth = 1.7,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.7 12S6.2 5.8 12 5.8 21.3 12 21.3 12 17.8 18.2 12 18.2 2.7 12 2.7 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.2 3.2 20.8 20.8" />
      <path d="M10.5 6.1A9.6 9.6 0 0 1 12 6c5.8 0 9.3 6 9.3 6a17.3 17.3 0 0 1-3.3 3.8" />
      <path d="M6.4 6.5C3.9 8.3 2.7 12 2.7 12s3.5 6.2 9.3 6.2c1.2 0 2.4-.3 3.4-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.8" y="4.8" width="18.4" height="14.4" rx="2.6" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Icon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7.1 3.8 9.4 8a1.6 1.6 0 0 1-.4 2L7.4 11.4a13.2 13.2 0 0 0 5.2 5.2l1.4-1.6a1.6 1.6 0 0 1 2-.4l4.2 2.3a1.6 1.6 0 0 1 .8 1.7l-.4 1.8a2.2 2.2 0 0 1-2.2 1.7A17.8 17.8 0 0 1 3.3 5.6 2.2 2.2 0 0 1 5 3.4l1.8-.4a1.6 1.6 0 0 1 1.7.8Z" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c.6-3.4 3.6-5.6 7.2-5.6s6.6 2.2 7.2 5.6" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.2" y="10" width="15.6" height="10.4" rx="2.6" />
      <path d="M8.1 10V7.4a3.9 3.9 0 0 1 7.8 0V10" />
      <path d="M12 14.2v2.4" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 20 6v5.3c0 4.6-3.2 8.1-8 9.7-4.8-1.6-8-5.1-8-9.7V6l8-3Z" />
      <path d="m8.6 12 2.3 2.3 4.5-4.6" />
    </Icon>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8.2" cy="8.2" r="4.4" />
      <path d="m11.4 11.4 8.3 8.3" />
      <path d="m16.2 16.2 2.1-2.1" />
      <path d="m19 19 1.8-1.8" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 6.8h15" />
      <path d="M9.2 6.8V4.9a1.4 1.4 0 0 1 1.4-1.4h2.8a1.4 1.4 0 0 1 1.4 1.4v1.9" />
      <path d="M6.6 6.8 7.4 20a1.4 1.4 0 0 0 1.4 1.3h6.4a1.4 1.4 0 0 0 1.4-1.3l.8-13.2" />
      <path d="M10 10.6v6.6M14 10.6v6.6" />
    </Icon>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 4.5H5.8A1.8 1.8 0 0 0 4 6.3v11.4a1.8 1.8 0 0 0 1.8 1.8h3.7" />
      <path d="M15.5 8.2 19.3 12l-3.8 3.8" />
      <path d="M19 12H9.4" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15" />
      <path d="m14 6.5 5.5 5.5L14 17.5" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 12h-15" />
      <path d="M10 6.5 4.5 12l5.5 5.5" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 5.5 6.5 6.5L9 18.5" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </Icon>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5.5 5.5 13 13M18.5 5.5l-13 13" />
    </Icon>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.2" />
      <path d="M12 16.4h.01" />
    </Icon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.2 2.6 2.6L16.2 9" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.2" />
      <path d="M12 7.6h.01" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2V12l3.2 2" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </Icon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9.5h17M3.5 14.5h17" />
      <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" />
    </Icon>
  );
}
