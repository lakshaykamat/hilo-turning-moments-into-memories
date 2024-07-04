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
