import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { ReactComponent as WaveSVG } from "../assets/wave.svg";
import "./Welcome.css";

// 요약형 숲 티저
import TreeTeaser from "../components/TreeTeaser";

export default function Welcome() {
  const openTerms = () => alert("서비스 이용약관은 준비 중입니다.");
  const openPrivacy = () => alert("개인정보 처리방침은 준비 중입니다.");

  return (
    <div className="welcome-container">
      {/* 상단 배경 웨이브 */}
      <div className="wave-wrapper" aria-hidden="true">
        <WaveSVG />
      </div>

      {/* 히어로 섹션 */}
      <section className="hero-section" role="banner">
        <h1>CupCycle</h1>
        <p className="hero-subtitle">지속 가능한 선택을 위한 첫걸음</p>
      </section>

      {/* 메인 콘텐츠 카드 */}
      <main className="main-content">
        <h2 className="main-heading">환영합니다!</h2>
        <p className="main-desc">QR 스캔 후 로그인하고 포인트를 적립해 보세요</p>

        {/* 우리 모두의 숲 - 요약 티저 (CTA 위에 배치) */}
        <div className="forest-teaser-wrap" aria-label="우리 모두의 숲 요약">
          {/* perTree=100 기준, localStorage의 global_stats.totalUses 사용 */}
          <TreeTeaser perTree={30} />
        </div>

        <div className="cta-container">
          <Button as={Link} to="/signup" variant="primary" block>
            회원가입
          </Button>
          <Button as={Link} to="/login" variant="outline" block>
            로그인
          </Button>
        </div>

        <p className="terms-note" role="note">
          로그인 또는 회원가입을 통해 <br />
          <button type="button" className="text-link" onClick={openTerms}>
            서비스 이용약관
          </button>{" "}
          및{" "}
          <button type="button" className="text-link" onClick={openPrivacy}>
            개인정보 처리방침
          </button>
          에 동의합니다.
        </p>
      </main>
    </div>
  );
}