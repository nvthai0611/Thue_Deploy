import { Geist, Nunito, Roboto, Urbanist } from "next/font/google";

export const nunito = Nunito({ subsets: ["latin"] });

export const geist_sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
