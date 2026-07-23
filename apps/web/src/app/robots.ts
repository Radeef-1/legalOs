import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/cases/", "/tasks/", "/documents/", "/reports/", "/api/"],
    },
    sitemap: "https://legalos.sa/sitemap.xml",
  };
}
