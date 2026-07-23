import React from "react";

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-card focus:shadow-interactive focus:outline-none"
    >
      الانتقال إلى المحتوى الرئيسي (Skip to main content)
    </a>
  );
}
