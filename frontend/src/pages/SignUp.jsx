// src/pages/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import InputField from "../components/InputField";
import "./SignUp.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function SignUp() {
  const [name, setName] = useState("");   // ← 표시용 이름(백엔드 first_name에 저장)
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(email);
  const isPwMatch = pw === pw2;
  const isFormValid = name.trim() && isEmailValid && pw && isPwMatch && termsAgreed;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isFormValid) {
      setError("모든 필드를 올바르게 입력하고 약관에 동의해주세요.");
      return;
    }

    setBusy(true);
    try {
      // email을 username으로 사용 + first_name에 이름 저장
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim(),    // 로그인용 아이디
          email: email.trim(),
          password: pw,
          first_name: name.trim(),   // ← 이름 저장 포인트
        }),
      });

      if (!res.ok) {
        let msg = "회원가입에 실패했습니다.";
        try {
          const data = await res.json();
          const firstKey = data && Object.keys(data)[0];
          if (firstKey) {
            const v = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
            msg = `${firstKey}: ${v}`;
          } else if (data?.detail) {
            msg = data.detail;
          }
        } catch {}
        throw new Error(msg);
      }

      // 성공 → 로그인 페이지로 이동 (이메일/이름을 state로 넘겨서 프리필/저장에 활용)
      navigate("/login", {
        replace: true,
        state: { signupEmail: email.trim(), signupName: name.trim() },
      });
    } catch (err) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="signup-container">
      <Header title="회원가입" back />
      <main className="signup-main">
        <p className="signup-greeting">
          어서오세요! <span className="highlight-text">Cupcycle</span> 입니다.
        </p>

        <form className="signup-form" onSubmit={onSubmit} noValidate>
          <InputField
            label="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="김눈송"
            required
          />

          <InputField
            label="이메일 (아이디)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            error={email && !isEmailValid ? "유효한 이메일 형식을 입력해주세요." : null}
            required
            autoComplete="username"
          />

          <InputField
            label="비밀번호"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
            autoComplete="new-password"
          />

          <InputField
            label="비밀번호 확인"
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            error={pw2 && !isPwMatch ? "비밀번호가 일치하지 않습니다." : null}
            required
            autoComplete="new-password"
          />

          <label className="terms-label">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              required
            />
            <span>
              <a href="/terms" className="terms-link" onClick={(e) => e.preventDefault()}>
                약관
              </a>{" "}
              및{" "}
              <a href="/privacy" className="terms-link" onClick={(e) => e.preventDefault()}>
                개인정보 처리방침
              </a>
              에 동의합니다.
            </span>
          </label>

          {error && <div className="signup-error" role="alert">{error}</div>}

          <Button type="submit" disabled={!isFormValid || busy}>
            {busy ? "가입 중..." : "가입하기"}
          </Button>
        </form>

        <div className="signin-prompt" role="note" aria-live="polite">
          이미 아이디가 있으신가요?{" "}
          <Link to="/login" className="signin-link">로그인하기</Link>
        </div>
      </main>
    </div>
  );
}
