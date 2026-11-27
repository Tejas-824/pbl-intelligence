"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// every route change starts at the top of the page
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
}