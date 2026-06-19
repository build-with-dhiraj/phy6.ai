import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://phy6.ai"),
  title: "phy6 — Learn everything, waste nothing.",
  description:
    "phy6 brings back the Renaissance mind. Learn the handful of first principles every hard idea is built from, and nothing is off-limits to you.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "phy6 — Learn everything, waste nothing.",
    description:
      "Every hard idea is built from a handful of simple, beautiful first principles. Learn those, and nothing is off-limits.",
    type: "website",
    siteName: "phy6.ai",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "phy6 — Learn everything, waste nothing.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "phy6 — Learn everything, waste nothing.",
    description:
      "Every hard idea is built from a handful of simple, beautiful first principles. Learn those, and nothing is off-limits.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${ebGaramond.variable}`}>
      <head>
        {/* No-JS fallback: scroll reveals render at opacity:0 in SSR markup and
            rely on client JS (whileInView) to appear. Without JS that copy would
            stay invisible. Force every reveal wrapper fully visible when scripts
            are disabled, so the manifesto and signature lines always read. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                "[data-reveal]{opacity:1 !important;transform:none !important;}",
            }}
          />
        </noscript>
      </head>
      <body>
        <a href="#manifesto" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
