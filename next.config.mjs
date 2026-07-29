import path from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute path to this package — not the parent Web/ monorepo. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static site for GitHub Pages (roberttgreat.github.io)
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  // Parent folder has package-lock.json; pin Turbopack root for local dev.
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
