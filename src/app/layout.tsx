import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "23-maktab", template: "%s | 23-maktab" },
  description: "23-maktabning rasmiy veb-sayti: yangiliklar, tadbirlar, o'qituvchilar, o'quvchilar kengashi va to'garaklar.",
  openGraph: { type: "website", locale: "uz_UZ", siteName: "23-maktab" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#1e3a8a", width: "device-width", initialScale: 1 };

// Ko'zi ojizlar sozlamalarini sahifa chizilishidan oldin qo'llaydi (miltillashsiz)
const a11yInit = `try{var a=JSON.parse(localStorage.getItem('a11y')||'{}'),h=document.documentElement;
if(a.font)h.style.fontSize=(100+a.font*12.5)+'%';if(a.contrast)h.classList.add('a11y-contrast');if(a.gray)h.classList.add('a11y-gray');}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: a11yInit }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
