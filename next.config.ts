import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @moss-js/moss-core ships a native/WASM asset that Turbopack can't
  // place inside an ESM chunk, so it must load as a real Node dependency.
  serverExternalPackages: ["@moss-js/moss", "@moss-js/moss-core"],
};

export default nextConfig;
