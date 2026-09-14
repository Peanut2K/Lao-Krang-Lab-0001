import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/** Reserved for the wordmark and the largest headings — see --font-serif. */
const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "คลังลวดลายไทย",
  description: "บันทึก แกะลาย และสืบค้นลวดลายไทยจากภาพถ่ายในชุมชน",
  applicationName: "คลังลวดลายไทย",
  // iOS ignores the manifest for home-screen launches; these drive it instead.
  appleWebApp: { capable: true, title: "ลวดลายไทย", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF9F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${notoThai.className} ${notoSerifThai.variable}`}>
      <body>{children}</body>
    </html>
  );
}
