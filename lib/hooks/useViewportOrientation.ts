"use client";

import { useEffect, useState } from "react";

export type ViewportOrientation = "portrait" | "landscape";

function detectOrientation(): ViewportOrientation {
  if (typeof window === "undefined") {
    return "landscape";
  }

  return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
}

export function useViewportOrientation() {
  const [orientation, setOrientation] = useState<ViewportOrientation>(() => detectOrientation());

  useEffect(() => {
    function handleChange() {
      setOrientation(detectOrientation());
    }

    handleChange();
    window.addEventListener("resize", handleChange);
    window.addEventListener("orientationchange", handleChange);

    return () => {
      window.removeEventListener("resize", handleChange);
      window.removeEventListener("orientationchange", handleChange);
    };
  }, []);

  return orientation;
}
