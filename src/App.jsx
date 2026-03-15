import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useThemeStore } from "./store/themeStore";
import "./index.css";

import AppRoutes from "./routes/AppRoutes";
import { NotificationContainer } from "./components/Notification";
import ScrollToTop from "./components/ScrollToTop";

function App() {

  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
       <ScrollToTop />
      <AppRoutes />

      <NotificationContainer />

    </BrowserRouter>
  );
}

export default App;