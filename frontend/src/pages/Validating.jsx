import { useEffect } from "react";
import Header from "../components/Header";
import "./Validating.css"; // CSS 파일 import
import environmentImg from "../assets/images/environment.png"; // 고정 이미지 import

export default function Validating(){
  useEffect(() => {
    const t = setTimeout(() => {
      // 실제 앱에서는 데이터 검증 API 호출 후 성공 시 이동
      window.location.href = "/validated";
    }, 3000); // 3초 대기
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="validating-container">
      <Header title="정보 확인 중" />
      <main className="validating-main">
        <h2 className="validating-heading">잠시 기다려주세요</h2>
        <p className="validating-message">포인트 적립을 위한 데이터 검증이 진행 중입니다</p>

        {/* 애니메이션 로딩 스피너 */}
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>

        {/* Fun Fact 섹션 */}
        <div className="fun-fact-card">
          <h3 className="fun-fact-title">잠깐, 환경 상식!</h3>
          <p className="fun-fact-text">
            지구 평균 기온은 지난 175년간 약 1.55도 상승했으며,<br></br>
            ‘1.5도 초과 첫 해’로 기록될 만큼 가장 뜨거운 해였습니다.
          </p>
          <p className="fun-fact-source">- 김규남 기자, 한겨레</p>
        </div>

        {/* 관련 뉴스 섹션 */}
        <a href="https://www.hani.co.kr/arti/society/environment/1187670.html" 
           className="news-link-card"
           target="_blank"
           rel="noopener noreferrer"
        >
          <div className="news-thumbnail">
            {/* 고정 이미지 사용 */}
            <img src={environmentImg} alt="지구 온난화" />
          </div>
          <div className="news-content">
            <p className="news-category">오늘의 뉴스</p>
            <h4 className="news-title">
              1.55도 오른 지구 온도,<br></br>175년 만에 가장 뜨거웠다
            </h4>
            <p className="news-source">김규남 기자 · 2025년 3월 19일</p>
          </div>
        </a>
      </main>
    </div>
  );
}
