// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import InputField from "../components/InputField";
import "./LoginPage.css";

// 백엔드 주소 (.env에 REACT_APP_API_BASE=http://localhost:8000 권장)
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function LoginPage() {
  // 회원가입에서 넘겨받은 이메일/이름을 프리필로 사용
  const location = useLocation();
  const prefillEmail = location.state?.signupEmail || "";
  const prefillName = location.state?.signupName || "";

  const [identifier, setIdentifier] = useState(prefillEmail); // username(=이메일) 입력
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/dashboard";

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      // 1) 토큰 발급
      const res = await fetch(`${API_BASE}/api/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: identifier.trim(), // 이메일을 username으로 사용
          password: password,
        }),
      });

      if (!res.ok) {
        let msg = "로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.";
        try {
          const data = await res.json();
          if (data?.detail) msg = data.detail;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();

      // 2) 토큰 저장
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // 3) 기본 사용자 식별자 저장(아이디/이메일)
      localStorage.setItem("current_user", identifier.trim());

      // 4) 현재 사용자 정보(me) 조회해서 이름 저장 (first_name 사용)
      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access}`,
          },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me.first_name) {
            localStorage.setItem("current_user_name", me.first_name);
          }
          if (me.email) {
            localStorage.setItem("current_user_email", me.email);
          }
        } else if (prefillName) {
          // me 엔드포인트가 없거나 실패한 경우 회원가입 때 받은 이름으로 보완 저장
          localStorage.setItem("current_user_name", prefillName);
        }
      } catch {
        if (prefillName) {
          localStorage.setItem("current_user_name", prefillName);
        }
      }

      // 5) 이동 (원래 가려던 경로 or /dashboard)
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-container">
      <Header title="로그인" back />
      <main className="login-main">
        <p className="login-greeting">반갑습니다! 로그인 후 서비스를 이용해 보세요.</p>

        <form className="login-form" onSubmit={onLogin}>
          <InputField
            label="아이디(또는 이메일)"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
          />
          <InputField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <div className="login-error">{error}</div>}

          <Button type="submit" disabled={!identifier || !password || busy}>
            {busy ? "로그인 중..." : "로그인"}
          </Button>

          <p className="signup-link">
            아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
