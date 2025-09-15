import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import Welcome from "./pages/Welcome";
import SignUp from "./pages/SignUp";
import Validating from "./pages/Validating";
import ValidatedSuccess from "./pages/ValidatedSuccess";
import TransactionDetail from "./pages/TransactionDetail";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Loginpage";

export default function App() {
  const [params] = useSearchParams();
  const bin = params.get("bin") || undefined; 

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/validating" element={<Validating />} />
      <Route path="/validated" element={<ValidatedSuccess />} />
      <Route path="/transaction" element={<TransactionDetail />} />
      <Route path="/dashboard" element={<Dashboard bin={bin} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
