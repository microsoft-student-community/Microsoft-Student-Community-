import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://mscsrmap.xyz").replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin/", "/login", "/onboarding", "/ticket", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

