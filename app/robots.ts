import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/events", "/gallery", "/team"],
      disallow: ["/admin", "/login", "/onboarding", "/ticket", "/api"],
    },
    sitemap: "https://mscsrmap.xyz//sitemap.xml",
  };
}
