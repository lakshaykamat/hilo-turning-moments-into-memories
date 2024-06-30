import React from "react";
import { Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import { BottomBar, Sidebar } from "./components/Sidebar";
import { useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProfilePage from "./pages/ProfilePage";
import TopBar from "./components/TopBar";
import SettingsPage from "./pages/SettingsPage";
import { Toaster } from "@/components/ui/toaster";
import PostPage from "./pages/PostPage";
import { Switch } from "react-router-dom";

const App = () => {
  const paths = ["/", "/login", "/posts", "/posts/:postsId", "/settings"];
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  return (
    <AuthProvider>
      <div
        className={`${!isLoginPage && "flex flex-col md:flex-row h-screen"}`}
      >
        {!isLoginPage ? <Sidebar /> : <NavBar />}
        <div className="flex-grow">
          {!isLoginPage && <TopBar />}
          <main className="px-8 py-8 md:ml-[18rem]">
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/posts/:postId" component={PostPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="*" component={NotFoundPage} />
            </Switch>
          </main>
        </div>
        {!isLoginPage && <BottomBar />}
      </div>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
