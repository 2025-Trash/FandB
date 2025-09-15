// src/App.jsx
import { Routes, Route, Navigate, useSearchParams, useLocation } from "react-router-dom";
import Welcome from "./pages/Welcome";
import SignUp from "./pages/SignUp";
import Validating from "./pages/Validating";
import ValidatedSuccess from "./pages/ValidatedSuccess";
import TransactionDetail from "./pages/TransactionDetail";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Loginpage";

// 간단 보호 라우트: localStorage에 access 토큰이 없으면 로그인 페이지로 이동
function RequireAuth({ children }) {
  const location = useLocation();
  const access = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  if (!access) {
    // 로그인 후 돌아올 경로를 state로 넘겨줌
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  const [params] = useSearchParams();
  const bin = params.get("bin") || undefined;

  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/validating" element={<Validating />} />
      <Route path="/validated" element={<ValidatedSuccess />} />

      {/* 보호 라우트 (로그인 필요) */}
      <Route
        path="/transaction"
        element={
          <RequireAuth>
            <TransactionDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard bin={bin} />
          </RequireAuth>
        }
      />

      {/* 그 외는 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
