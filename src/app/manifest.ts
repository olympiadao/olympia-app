import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Olympia Governance — CoreDAO for Ethereum Classic",
    short_name: "Olympia",
    description:
      "CoreDAO governance application for Ethereum Classic. Browse proposals, vote, and manage treasury.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f10",
    theme_color: "#00ffae",
    icons: [
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
