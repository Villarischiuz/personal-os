import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    /**
     * Force lucide-react to resolve to its CJS bundle instead of the ESM
     * build. lucide-react v1.8.0 ESM files have `"use strict"` BEFORE
     * `"use client"`, which prevents Turbopack from recognising the client
     * boundary and causes "Element type is invalid" at runtime.
     */
    resolveAlias: {
      "lucide-react": "./node_modules/lucide-react/dist/cjs/lucide-react.js",
    },
  },
};

export default nextConfig;
