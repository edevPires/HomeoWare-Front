import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={
          {
            "--toastify-color-light": "var(--color-light)",
            "--toastify-color-dark": "var(--color-light)",
            "--toastify-color-info": "var(--color-primary)",
            "--toastify-color-success": "var(--color-primary)",
            "--toastify-color-warning": "#f1c40f",
            "--toastify-color-error": "#e74c3c",
            "--toastify-text-color-light": "var(--color-font)",
            "--toastify-color-progress-light": "var(--color-primary)",
            "--toastify-color-progress-dark": "var(--color-primary)",
            "--toastify-color-progress-bgo": "rgba(90, 227, 167, 0.2)",
          } as React.CSSProperties
        }
        toastStyle={{
          background: "var(--color-light)",
          color: "var(--color-font)",
          border: "1px solid var(--color-light-border)",
          borderRadius: "0.5rem",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
        closeButton={false}
      />
    </StrictMode>
  );
}
