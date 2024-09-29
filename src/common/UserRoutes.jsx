// src/App.js
import { Routes, BrowserRouter, Route } from "react-router-dom";
import { useEffect } from "react";
import useDataStore from "../zustand/userDataStore";
import { ValidAuthroutes } from "./validRoute";
import { InvalidAuthRoute } from "./InvalidAuthRoute";

function UserRoute() {
  const user = useDataStore((state) => state.user);
  const setUser = useDataStore((state) => state.setUser);

  // Check for session expiration
  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      const { userData, timestamp } = JSON.parse(session);
      const currentTime = new Date().getTime();
      
      // If session is older than 24 hours (86400000 milliseconds)
      if (currentTime - timestamp > 86400000) {
        localStorage.removeItem("session");
        setUser(null); // Log out user
      } else {
        setUser(userData); // Restore session
      }
    }
  }, [setUser]);

  // Store session data when user logs in
  useEffect(() => {
    if (user) {
      const sessionData = {
        userData: user,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("session", JSON.stringify(sessionData));
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          <>
            {ValidAuthroutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </>
        ) : (
          <>
            {InvalidAuthRoute.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default UserRoute;
