import type { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "@/components/layout/RootLayoutClient";

export const metadata: Metadata = {
  title: "Virtual Mining Blast Lab",
  description:
    "Explore mining scenarios through virtual simulation. Adjust geological and simulation parameters, run virtual scenarios, and compare predicted outcomes.",
  keywords: ["mining", "blast simulation", "virtual lab", "geology", "engineering"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
