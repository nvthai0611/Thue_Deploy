// app/layout.tsx
import Script from "next/script";
import QueryProvider from "@/components/query-provider";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";
import UpdateUserStorage from "@/components/auth/update-user-storage";
import { Toaster } from "@/components/ui/sonner";
import UpdateUserLastActive from "@/components/auth/update-user-last-active";
import { HolaChatbot } from "@/components/hola-chatbot";
import GARouteTracker from "@/components/ga-route-tracker";
import { Suspense } from "react";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Hola Rental",
  description: "The best place for student when looking for a room",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

// Dùng env nếu có, fallback mã bạn đang dùng
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-LMBP6Q6JBW";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js"></script>
        <script
          id="oval_custom"
          src="https://ekyc-web.icenter.ai/lib/VNPTBrowserSDKApp.js"
        ></script>

        {/* GA4 loader */}
        <Script
          id="ga4-src"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        {/* GA4 init (tắt auto page_view → tự bắn khi đổi route) */}
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: false });
          `}
        </Script>
      </head>

      <body className="bg-background text-foreground">
        {/* Bắn page_view khi đổi route (App Router) */}
        <Suspense fallback={null}>
          <GARouteTracker gaId={GA_ID} />
        </Suspense>

        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <UpdateUserStorage />
            <UpdateUserLastActive />
            <HolaChatbot />
            <Toaster
              position="top-center"
              richColors
              expand={true}
              duration={3000}
              closeButton={false}
              toastOptions={{ style: { zIndex: 99999 } }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
