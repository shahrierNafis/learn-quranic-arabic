import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import CheckAuth from "@/components/CheckAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import UserDataOutOfSync from "@/components/UserDataOutOfSync";

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
    <html lang="en">
      <head>
        <meta property="og:title" content="Learn Quran/Arabic" />
        <meta property="og:image" content="/image.jpg" />
        <meta
          property="og:description"
          content="Learn Quranic Arabic More Efficiently And Effectively Using Spaced Repetition And Active Recall"
        />
      </head>
      <body className={comfortaa.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CheckAuth />
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <div className="absolute md:m-4 md:hidden">
              <SidebarTrigger />
            </div>

            <main className="w-full">{children}</main>
            <UserDataOutOfSync />
            <Toaster position="top-left" richColors />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
