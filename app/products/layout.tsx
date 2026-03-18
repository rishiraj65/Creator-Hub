import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Digital Tools",
  description: "Browse our curated collection of AI tools, SaaS templates, and design resources. Filter by price, rating, and category.",
  openGraph: {
    title: "Explore Digital Tools | CreatorHub",
    description: "Browse our curated collection of AI tools, SaaS templates, and design resources.",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
