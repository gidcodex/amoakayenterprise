import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

import StoreProvider from "@/app/StoreProvider";
import WishlistInitializer from "@/components/WishlistInitializer";
import AdetoBoafo from "@/components/ai/AdetoBoafo";
import AdetoBoafoProvider from "@/components/ai/core/AdetoBoafoProvider";
import { LanguageProvider } from "@/context/LanguageContext";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Amoakay Deals - Shop Smarter",
  description:
    "Shop quality electronics, gadgets and accessories on Amoakay Deals.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${outfit.className} antialiased`}
        >
          <LanguageProvider>
            <StoreProvider>
              <WishlistInitializer />

              <AdetoBoafoProvider>
                <Toaster />

                {children}

                <AdetoBoafo />
              </AdetoBoafoProvider>
            </StoreProvider>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}