"use client";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomBar, Sidebar } from "@/components/Sidebar";
import NavBar from "@/components/NavBar";
import TopBar from "@/components/TopBar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import AuthLayout from "./ProtectPage";
import MetaTag from "./MetaTags";

const inter = Inter({ subsets: ["latin"] });

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  return (
    <html lang="en">
      <head>
        <title>SyncTalk</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="SyncTalk - A chat and post-sharing platform where users can share posts and engage through likes, comments, and shares."
        />
        <meta
          name="keywords"
          content="SyncTalk, chat application, post sharing, social media, messaging, like, comment, share"
        />
        <meta name="author" content="Lakshay Kamat" />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content="SyncTalk - Chat and Post Sharing Platform"
        />
        <meta
          property="og:description"
          content="Join SyncTalk to share posts, chat with friends, and engage with the community through likes, comments, and shares."
        />
        <meta property="og:image" content="URL_to_your_image" />
        <meta property="og:url" content="https://synctalk.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="SyncTalk - Chat and Post Sharing Platform"
        />
        <meta
          name="twitter:description"
          content="Join SyncTalk to share posts, chat with friends, and engage with the community through likes, comments, and shares."
        />
        <meta name="twitter:image" content="URL_to_your_image" />
        <meta name="twitter:site" content="@lakshaykamat" />
      </head>
      <body>
        <AuthProvider>
          <AuthLayout>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div
                className={`${
                  !isLoginPage && "flex flex-col md:flex-row h-screen"
                }`}
              >
                {!isLoginPage ? <Sidebar /> : <NavBar />}
                <div className="flex-grow">
                  {!isLoginPage && <TopBar />}
                  <main
                    className={`px-4 py-4 sm:px-8 sm:py-8 ${
                      !isLoginPage && "md:ml-[18rem]"
                    }`}
                  >
                    {children}
                  </main>
                </div>
                {!isLoginPage && <BottomBar />}
                <Toaster />
              </div>
            </ThemeProvider>
          </AuthLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
