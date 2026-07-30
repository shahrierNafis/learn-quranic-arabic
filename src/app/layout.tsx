import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
// import CheckAuth from "@/components/CheckAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
// import UserDataOutOfSync from "@/components/UserDataOutOfSync";
// import HydrateOnlineStorage from "./HydrateOnlineStorage";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learn Quran/Arabic",
  description: "Using Cloze Testing And Spaced Repetition To Make Learning Arabic Faster And More Effective",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta property="og:title" content="Learn Quran/Arabic" />
        <meta property="og:image" content="/image.jpg" />
        <meta
          property="og:description"
          content="Learn Quranic Arabic More Efficiently And Effectively Using Spaced Repetition And Active Read"
        />
      </head>
      <body className={comfortaa.className}>
        <ConvexClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />

              {/* Added container wrapper for proper sidebar layout structure */}
              <div className="relative flex flex-1 flex-col min-h-screen w-full">
                <div className="absolute md:m-4 md:hidden">
                  <SidebarTrigger />
                </div>

                <main className="w-full flex-1">{children}</main>
              </div>

              <Toaster position="bottom-left" richColors />
            </SidebarProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
