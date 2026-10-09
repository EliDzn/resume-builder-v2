import { createBrowserRouter } from "react-router-dom";
import Editor from "./pages/editor";
import NotFound from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Editor />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);
