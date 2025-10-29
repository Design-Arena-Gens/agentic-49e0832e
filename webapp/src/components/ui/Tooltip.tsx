"use client";

import { ReactNode, useId, useState } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
};

export function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex">
      <span
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex"
      >
        {children}
      </span>
      {open ? (
        <span
          role="tooltip"
          id={tooltipId}
          className="absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-1 text-xs text-white shadow-lg"
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
