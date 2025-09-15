// src/pages/SignUp.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import InputField from "../components/InputField";
import "./SignUp.css";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

  // 이메일 유효성 검사 정규식
  const emailRegex =
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(email);
  const isPwMatch = pw === pw2;
  const isFormValid =
    name.trim() && isEmailValid && pw && isPwMatch && termsAgreed;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("모든 필드를 올바르게 입력하고 약관에 동의해주세요.");
      return;
    }
    const user = { name: name.trim(), email: email.trim(), points: 0, uses: 0 };
    localStorage.setItem("demo_user", JSON.stringify(user));
    window.location.href = "/validating";
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
              <a
                href="/terms"
                className="terms-link"
                onClick={(e) => e.preventDefault()}
              >
                약관
              </a>{" "}
              및{" "}
              <a
                href="/privacy"
                className="terms-link"
                onClick={(e) => e.preventDefault()}
              >
                개인정보 처리방침
              </a>
              에 동의합니다.
            </span>
          </label>

          <Button type="submit" disabled={!isFormValid}>
            가입하기
          </Button>
        </form>

        {/* 로그인 유도 섹션 */}
        <div className="signin-prompt" role="note" aria-live="polite">
          이미 아이디가 있으신가요?{" "}
          <Link to="/login" className="signin-link">
            로그인하기
          </Link>
        </div>
      </main>
    </div>
  );
}
