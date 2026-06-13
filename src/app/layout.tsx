import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillRoadmap - AI-Powered Learning Paths",
  description:
    "Generate structured learning roadmaps for any skill. From frontend development to cooking — get a personalized path to mastery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
