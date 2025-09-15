import React from "react";
import { Link } from "react-router-dom"; // Link 컴포넌트 import
import Header from "../components/Header";
import Button from "../components/Button";
import "./ValidatedSuccess.css"; // CSS 파일 import

export default function ValidatedSuccess() {
  return (
    <div className="success-container">
      {/* '성공' 대신 '포인트 적립'으로 헤더 변경 */}
      <Header title="포인트 적립" />
      <main className="success-main">
        {/* 애니메이션이 적용된 체크 아이콘 */}
        <div className="success-icon-wrapper">
          <div className="success-icon">✓</div>
        </div>

        {/* 헤딩 문구를 더 친근하게 변경 */}
        <h2 className="success-heading">
          축하해요!<br></br>포인트가 적립되었습니다
        </h2>

        {/* 메시지 문구를 더 명확하게 변경 */}
        <p className="success-message">
          쓰레기통 이용에 대한 보상 포인트가 성공적으로 적립되었어요.
        </p>

        <div className="success-cta-buttons">
          {/* 버튼 문구를 명확하게 변경 */}
          <Button as={Link} to="/transaction" variant="outline" block>
            포인트 내역 보기
          </Button>
          <Button as={Link} to="/dashboard" variant="primary" block>
            대시보드 바로가기
          </Button>
        </div>
      </main>
    </div>
  );
}