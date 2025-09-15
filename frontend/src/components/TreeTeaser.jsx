import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./TreeTeaser.css";

// 단계 이미지
import stage1 from "../assets/trees/tree-1.png"; // 새싹
import stage2 from "../assets/trees/tree-2.png"; // 중간
import stage3 from "../assets/trees/tree-3.png"; // 완성

/** ================================
 *  Storage / Backend Helper
 *  ================================ */
const LS_KEY = "global_stats";

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return isPlainObject(parsed) ? parsed : fallback; // null/배열/문자열/숫자 → fallback
  } catch {
    return fallback;
  }
}

function readLocalStats() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw === null || raw === "null" || raw === "undefined" || raw === "") {
    return { totalUses: 0, totalPoints: 0 };
  }
  const obj = safeParse(raw, { totalUses: 0, totalPoints: 0 });
  const totalUses = Number.isFinite(Number(obj.totalUses)) ? Number(obj.totalUses) : 0;
  const totalPoints = Number.isFinite(Number(obj.totalPoints)) ? Number(obj.totalPoints) : 0;
  return { totalUses, totalPoints };
}

function writeLocalStats(stats) {
  const toWrite = {
    totalUses: Number.isFinite(Number(stats?.totalUses)) ? Number(stats.totalUses) : 0,
    totalPoints: Number.isFinite(Number(stats?.totalPoints)) ? Number(stats.totalPoints) : 0,
  };
  localStorage.setItem(LS_KEY, JSON.stringify(toWrite));
}

/**
 * 백엔드로부터 글로벌 통계 가져오기 (토큰이 있을 때만 시도)
 * - 성공: {totalUses,totalPoints} 반환 + 로컬 저장소에도 동기화
 * - 실패: undefined 반환 (호출부에서 로컬 폴백)
 */
async function fetchGlobalFromApi({ apiBase = "/api", authToken, signal }) {
  if (!authToken) return undefined; // 토큰 없으면 백엔드 호출 안 함
  try {
    const res = await fetch(`${apiBase}/stats/global`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      signal,
      credentials: "include", // 쿠키 인증도 병행한다면 유지
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!isPlainObject(data)) throw new Error("Invalid payload");

    const totalUses = Number.isFinite(Number(data.totalUses)) ? Number(data.totalUses) : 0;
    const totalPoints = Number.isFinite(Number(data.totalPoints)) ? Number(data.totalPoints) : 0;

    // 로컬에도 동기화(오프라인/비로그인 시 연속성)
    writeLocalStats({ totalUses, totalPoints });
    return { totalUses, totalPoints };
  } catch {
    return undefined;
  }
}

/** ================================
 *  Component
 *  ================================ */
/**
 * TreeTeaser
 * - perTree: 몇 회당 나무 1그루인지
 * - maxTiles: 격자에 보여줄 최대 타일 수
 * - apiBase: 백엔드 베이스 경로 (기본 "/api")
 * - authToken: 외부에서 토큰 주입 가능 (없으면 localStorage.auth_token 시도)
 */
export default function TreeTeaser({
  perTree = 30,
  maxTiles = 12,
  apiBase = "/api",
  authToken: authTokenProp,
}) {
  // 잘못된 값 사전 방어
  const safePerTree = perTree > 0 ? perTree : 30;
  const [stats, setStats] = useState(() => readLocalStats());
  const abortRef = useRef(null);

  // 초기 정리: "null"/"undefined"/"" 같은 쓰레기 값 제거
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw === "null" || raw === "undefined" || raw === "") {
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  // 로그인 감지: prop 우선, 없으면 localStorage에서 조회
  const authToken =
    typeof authTokenProp === "string" && authTokenProp.length > 0
      ? authTokenProp
      : (() => {
          const t = localStorage.getItem("auth_token");
          return t && t !== "null" && t !== "undefined" ? t : undefined;
        })();

  // 스토리지/가시성/폴링으로 로컬 동기화
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_KEY) setStats(readLocalStats());
    };
    const onVisibility = () => {
      if (!document.hidden) setStats(readLocalStats());
    };
    const poll = setInterval(() => setStats(readLocalStats()), 1500);

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(poll);
    };
  }, []);

  // 백엔드가 있으면 주기적으로 동기화(로그인 상태 가정)
  useEffect(() => {
    if (!authToken) return; // 비로그인: 로컬만 사용

    const syncOnce = async (signal) => {
      const api = await fetchGlobalFromApi({ apiBase, authToken, signal });
      if (api) setStats(api); // 성공 시 백엔드 기준으로 갱신
      else setStats(readLocalStats()); // 실패 시 로컬
    };

    // 즉시 1회 동기화
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    syncOnce(abortRef.current.signal);

    // 30초마다 백엔드 동기화
    const t = setInterval(() => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      syncOnce(abortRef.current.signal);
    }, 30_000);

    return () => {
      clearInterval(t);
      abortRef.current?.abort();
    };
  }, [authToken, apiBase]);

  const totalUses = stats.totalUses;

  // 그루/진행도 계산
  const trees = Math.floor(totalUses / safePerTree);
  const progress = totalUses % safePerTree;
  const leftToNext = progress === 0 ? 0 : safePerTree - progress;
  const pct = Math.round((progress / safePerTree) * 100);

  // 격자 타일 계산(완성 그루 + 성장중 1개)
  const { tiles, overflowCount } = useMemo(() => {
    const fullCount = Math.min(trees, Math.max(0, maxTiles));
    const remainTiles = Math.max(0, maxTiles - fullCount);
    const showGrowing = progress > 0 && remainTiles > 0;

    const arr = Array(fullCount).fill(stage3);
    if (showGrowing) {
      const stage =
        progress >= safePerTree * 0.67 ? stage3 :
        progress >= safePerTree * 0.34 ? stage2 : stage1;
      arr.push(stage);
    }

    const totalShown = arr.length;
    const totalTreesToRepresent = trees + (progress > 0 ? 1 : 0);
    const overflow = Math.max(0, totalTreesToRepresent - totalShown);

    return { tiles: arr, overflowCount: overflow };
  }, [trees, progress, safePerTree, maxTiles]);

  return (
    <section className="forest-teaser" aria-labelledby="forest-teaser-title">
      <div className="forest-head">
        <div className="forest-eyebrow">우리 모두의 숲</div>
        <h3 id="forest-teaser-title" className="forest-title">
          함께 키운 나무{" "}
          <b className="forest-strong" aria-live="polite" aria-atomic="true">
            {trees.toLocaleString()}
          </b>
          그루
        </h3>
        <p className="forest-sub">
          다음 나무까지 <b className="forest-strong">{leftToNext}</b>회
        </p>
      </div>

      <div className="forest-grid">
        {tiles.map((src, i) => (
          <div key={i} className="forest-cell" aria-hidden="true">
            <img src={src} alt="" />
          </div>
        ))}
        {overflowCount > 0 && (
          <div
            className="forest-cell more"
            aria-label={`추가 나무 ${overflowCount}그루`}
          >
            +{overflowCount.toLocaleString()}
          </div>
        )}
      </div>

      <div
        className="forest-progress"
        role="progressbar"
        aria-label="다음 나무까지 진행률"
        aria-valuemin={0}
        aria-valuemax={safePerTree}
        aria-valuenow={progress}
      >
        <div className="forest-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="forest-cta">
        <Link to="/dashboard" className="forest-link">숲 보러가기</Link>
      </div>
    </section>
  );
}
