import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./state-ui.css";
import { SettingsProvider } from "@/lib/settings";
import { NetworkProvider } from "@/components/NetworkProvider";
import { OfflineBanner } from "@/components/OfflineBanner";
import GlobalErrorListeners from "@/components/GlobalErrorListeners";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

const pwaBootstrap = `(function(){if(!('serviceWorker' in navigator)){return;}window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});var captured=false;function onPrompt(e){if(captured){return;}captured=true;try{window.__quickyInstallPrompt=e;}catch(err){}window.removeEventListener('beforeinstallprompt',onPrompt);}window.addEventListener('beforeinstallprompt',onPrompt);window.addEventListener('appinstalled',function(){window.__quickyInstallPrompt=undefined;});})();`;

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
      <head>
        {CONVEX_SITE_URL ? (
          <link
            rel="preconnect"
            href={CONVEX_SITE_URL}
            crossOrigin="anonymous"
          />
        ) : null}
        <link rel="dns-prefetch" href="//overpass-api.de" />
        <link rel="dns-prefetch" href="//overpass.kumi.systems" />
        <link rel="dns-prefetch" href="//overpass.private.coffee" />
        <link rel="dns-prefetch" href="//maps.mail.ru" />
        <link rel="dns-prefetch" href="//overpass.osm.ch" />
        <link rel="dns-prefetch" href="//overpass.openstreetmap.fr" />
        <script
          dangerouslySetInnerHTML={{ __html: pwaBootstrap }}
        />
      </head>
      <body>
        <SettingsProvider>
          <NetworkProvider>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <OfflineBanner />
            <GlobalErrorListeners />
            {children}
          </NetworkProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
