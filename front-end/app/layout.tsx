import QueryProvider from "@/components/query-provider";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";
import UpdateUserStorage from "@/components/auth/update-user-storage";
import { Toaster } from "@/components/ui/sonner";
import UpdateUserLastActive from "@/components/auth/update-user-last-active";
import { HolaChatbot } from "@/components/hola-chatbot";

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
        {/* <script src="https://ekyc-web.icenter.ai/lib/jsQR.js"></script> */}
      </head>

      <body className="bg-background text-foreground">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            {/* <EkycSdkLoader /> */}
            <UpdateUserStorage />
            <UpdateUserLastActive />
            <HolaChatbot />

            <Toaster
              position="top-center"
              richColors
              expand={true}
              duration={3000}
              closeButton={false}
              toastOptions={{
                style: {
                  zIndex: 99999,
                },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
