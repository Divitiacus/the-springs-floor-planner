import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Springs Floor Planner",
  description: "A purpose-built event floorplan editor for The Springs Events.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
