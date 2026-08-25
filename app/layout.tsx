import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Quicky — Thailand Travel Hub",
  description:
    "Eight handy Thailand-travel tools — cost converter, location, bathrooms, attractions, day counter, Bolt, banking and weather. Real APIs, no mocks.",
  applicationName: "Quicky",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Quicky",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/icons/Icon-192.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#5B3DF5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
