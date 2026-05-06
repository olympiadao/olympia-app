import type { MetadataRoute } from "next";
import { execSync } from "child_process";

function gitDate(filePath: string): Date {
  try {
    const iso = execSync(`git log -1 --format="%cI" -- "${filePath}"`, {
      encoding: "utf8",
      cwd: process.cwd(),
    }).trim();
    return iso ? new Date(iso) : new Date();
  } catch {
    return new Date();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://app.olympiadao.org";

  return [
    {
      url: baseUrl,
      lastModified: gitDate("src/app/page.tsx"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/proposals`,
      lastModified: gitDate("src/app/proposals/page.tsx"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/proposals/new`,
      lastModified: gitDate("src/app/proposals/new/page.tsx"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/treasury`,
      lastModified: gitDate("src/app/treasury/page.tsx"),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: gitDate("src/app/members/page.tsx"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: gitDate("src/app/how-it-works/page.tsx"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contracts`,
      lastModified: gitDate("src/app/contracts/page.tsx"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/maintainer`,
      lastModified: gitDate("src/app/maintainer/page.tsx"),
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];
}
