import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import { ClerkProvider } from "@clerk/nextjs";
import AdetoBoafo from "@/components/ai/AdetoBoafo";
import AdetoBoafoProvider from "@/components/ai/core/AdetoBoafoProvider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "Amoakaydeals. - Shop smarter",
    description: "Amoakaydeals. - Shop smarter",
};

export default function RootLayout({ children }) {
    return (
     <ClerkProvider>
          <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <StoreProvider>
                 <AdetoBoafoProvider>
                     <Toaster />
                       {children}
                     <AdetoBoafo />
                 </AdetoBoafoProvider>
                </StoreProvider>
            </body>
          </html> 
     </ClerkProvider>
    );
}
