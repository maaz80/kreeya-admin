import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "../utils/auth.js";

export default function ProtectedRoute({ children }) {
     if (!isAdminLoggedIn()) {
          return <Navigate to="/login" replace />;
     }

     return children;
}
