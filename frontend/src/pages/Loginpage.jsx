// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // react-router-dom의 useNavigate 훅 사용
import Header from "../components/Header";
import Button from "../components/Button";
import InputField from "../components/InputField";
import "./LoginPage.css";

function getUserData(email) {
  const raw = localStorage.getItem("demo_user");
  const user = raw ? JSON.parse(raw) : null;
  // 임시 로그인 로직: 이메일만 일치하면 성공으로 간주
  // 실제 앱에서는 비밀번호 검증이 필요
  if (user && user.email === email) {
    return user;
  }
  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onLogin = (e) => {
    e.preventDefault();
    setError("");
    const user = getUserData(email);

    if (user) {
      // 로그인 성공 시 로컬 스토리지에 사용자 정보 저장 (세션 유지)
      localStorage.setItem("demo_user", JSON.stringify(user));
      navigate("/dashboard");
    } else {
      setError("입력하신 정보와 일치하는 사용자가 없습니다.");
    }
  };

  return (
    <div className="login-container">
      <Header title="로그인" back />
      <main className="login-main">
        <p className="login-greeting">반갑습니다! 로그인 후 서비스를 이용해 보세요.</p>
        <form className="login-form" onSubmit={onLogin}>
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="login-error">{error}</div>}
          <Button type="submit" disabled={!email || !password}>로그인</Button>
          <p className="signup-link">
            아직 회원이 아니신가요? <a href="/signup">회원가입</a>
          </p>
        </form>
      </main>
    </div>
  );
}