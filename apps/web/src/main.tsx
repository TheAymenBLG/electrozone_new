import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { CompareProvider } from "./context/CompareContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <CompareProvider>
            <App />
          </CompareProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);