import type { Metadata } from "next";
import { MobileDeviceNotice } from "@/components/MobileDeviceNotice";
import "./globals.css";

export const metadata: Metadata = {
  title: "Floor Plan Designer | The Springs",
  description: "Choose a Springs location and hall to begin a floor plan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <MobileDeviceNotice />
      </body>
    </html>
  );
}
