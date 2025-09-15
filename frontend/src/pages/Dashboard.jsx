// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Button from "../components/Button";
import "./Dashboard.css";

/* ---------------- API ---------------- */
// 기본값 개선: 모바일에서도 자동으로 맥 IP를 따오도록 hostname 기반 포백
const DEFAULT_API_BASE = `http://${window.location.hostname}:8000`;
const API_BASE = process.env.REACT_APP_API_BASE || DEFAULT_API_BASE;

const authHeader = () => {
  const token = localStorage.getItem("access");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function apiGet(path, { auth = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(auth ? authHeader() : {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(path, body, { auth = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(auth ? authHeader() : {}) },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}

/* ---------------- helpers (로컬 상태) ---------------- */
function nowStr() {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}
const todayKey = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
// 이름 우선 → 없으면 이메일 → 없으면 "me"
const username = () =>
  localStorage.getItem("current_user_name") ||
  localStorage.getItem("current_user") ||
  "me";

const dailyKeyFor = (u) => `uses_by_date_${u}`;
const redemptionsKeyFor = (u) => `redemptions_${u}`;
const pointsKeyFor = (u) => `points_${u}`; // 포인트 임시 로컬 보관(서버 모델 생기면 교체)

/* ---------------- domain: 카페 & 리워드 ---------------- */
const CAFES = [
  { id: "espresso-coffee", name: "에스프레소 커피", partner: true },
  { id: "bruda-coffee", name: "브루다 커피", partner: true },
  { id: "at-express", name: "AT. EXPRESS", partner: true },
  { id: "the-bake", name: "더베이크", partner: false },
  { id: "twosome", name: "투썸 플레이스", partner: true },
  { id: "the-cafe-n-sookdae", name: "더카페엔 숙대정문점", partner: true },
  { id: "baekdabang", name: "빽다방", partner: true },
  { id: "compose-coffee", name: "컴포즈커피", partner: true },
  { id: "starbucks", name: "스타벅스", partner: true },
  { id: "bonsol-coffee", name: "본솔커피", partner: true },
];

const REWARDS = [
  { id: "bronze", tier: "Bronze", cost: 40, title: "10% OFF 쿠폰", type: "coupon" },
  { id: "silver", tier: "Silver", cost: 80, title: "사이즈업 쿠폰", type: "coupon" },
  { id: "gold", tier: "Gold", cost: 120, title: "₩1,000 할인", type: "coupon" },
];

/* ===== 상수 ===== */
const PERSONAL_PER_TREE = 5; // 개인: 5회 = 1그루
const COMMUNITY_PER_TREE = 30; // 커뮤니티: 30회 = 1그루
const REWARD_EXPIRE_HOURS = 48;

function clampPct(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// 개인 나무가 새로 생겼는지 판정
function crossedTree(before, after, per) {
  return Math.floor(before / per) < Math.floor(after / per);
}

/* ================= ForestField ================= */
function ForestField({ trees = 0, cap = 300, size = 18, label, variant = "light" }) {
  const count = Math.min(trees, cap);
  const overflow = Math.max(0, trees - cap);
  return (
    <div className={`field-wrap ${variant}`} aria-label={label || "forest"}>
      <div className="field-grass">
        <div className="field-grid" style={{ fontSize: `${size}px` }}>
          {Array.from({ length: count }).map((_, i) => (
            <span className="tree" key={i} role="img" aria-label="tree">
              🌳
            </span>
          ))}
        </div>
        {overflow > 0 && <div className="field-overflow">+{overflow}</div>}
      </div>
    </div>
  );
}

/* ---------------- main component ---------------- */
export default function Dashboard({ bin }) {
  const userName = username();

  // 서버 동기화 값
  const [myTotal, setMyTotal] = useState(0); // /api/trees/me/ → { total }
  const [globalTrees, setGlobalTrees] = useState(0); // /api/trees/global/ → { total_trees }

  // 로컬 보조 상태 (UX용)
  const [todayUses, setTodayUses] = useState(0);
  const [points, setPoints] = useState(() => Number(localStorage.getItem(pointsKeyFor(userName)) || 0));
  const [range, setRange] = useState("day"); // day/week/month
  const [globalDaily, setGlobalDaily] = useState(() => {
    const raw = localStorage.getItem("global_uses_by_date");
    return raw ? JSON.parse(raw) : {};
  });

  // URL cafe param
  const [cafeParam, setCafeParam] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cafe = params.get("cafe");
    if (cafe) setCafeParam(cafe);
  }, []);

  // 오늘 내 사용 로드
  useEffect(() => {
    const mapRaw = localStorage.getItem(dailyKeyFor(userName));
    const map = mapRaw ? JSON.parse(mapRaw) : {};
    setTodayUses(map[todayKey()] || 0);
  }, [userName]);

  // 서버에서 합계 로드
  async function fetchTotals() {
    try {
      const [mine, global] = await Promise.all([
        apiGet("/api/trees/me/", { auth: true }),
        apiGet("/api/trees/global/"),
      ]);
      setMyTotal(mine.total || 0);
      setGlobalTrees(global.total_trees || 0);
    } catch (e) {
      // 토큰 만료 등은 상위 라우터(RequireAuth)에서 처리
      console.error("fetchTotals error:", e);
    }
  }
  useEffect(() => {
    fetchTotals();
  }, []);

  // 쿠폰함(로컬)
  const [redeems, setRedeems] = useState(() => {
    const raw = localStorage.getItem(redemptionsKeyFor(userName));
    return raw ? JSON.parse(raw) : [];
  });
  useEffect(() => {
    localStorage.setItem(redemptionsKeyFor(userName), JSON.stringify(redeems));
  }, [redeems, userName]);

  useEffect(() => {
    const t = setInterval(() => {
      setRedeems((prev) =>
        prev.map((r) => (r.status === "issued" && Date.now() > r.expireAt ? { ...r, status: "expired" } : r))
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  /* --------- 계산값 --------- */
  const treesPersonal = useMemo(() => Math.floor(myTotal / PERSONAL_PER_TREE), [myTotal]);
  const personalMod = myTotal % PERSONAL_PER_TREE;
  const personalPct = clampPct((personalMod / PERSONAL_PER_TREE) * 100);

  // 서버가 "전체 사용 횟수"는 제공하지 않으므로, 전체 그루 수만 표시
  const treesCommunity = globalTrees;

  // 기간 합계(커뮤니티) — 지금은 로컬 집계(우리 앱에서 기록된 것만)
  const communityRangeSum = useMemo(() => {
    const base = new Date(todayKey());
    const days = range === "day" ? 1 : range === "week" ? 7 : 30;
    let sum = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      sum += globalDaily[key] || 0;
    }
    return sum;
  }, [globalDaily, range]);

  // 내가 오늘 커뮤니티 1그루 기준으로 얼마나 기여했는지(로컬 기준)
  const communityContributionPct = clampPct(((todayUses+1) / COMMUNITY_PER_TREE) * 100);

  /* -------- 쓰레기통 사용(서버 동기화 + 낙관적 업데이트) -------- */
  const useOnceWithCafe = async (cafeId) => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // 0) 현재 값 스냅샷
    const beforeMyTotal = myTotal;
    const beforeGlobalTrees = globalTrees;

    // 1) 낙관적 업데이트(화면 즉시 반응)
    //    - 내 총 사용 +1
    setMyTotal((prev) => prev + 1);
    //    - 개인 나무가 막 자랐으면 우리 숲도 즉시 +1
    if (crossedTree(beforeMyTotal, beforeMyTotal + 1, PERSONAL_PER_TREE)) {
      setGlobalTrees((prev) => prev + 1);
    }

    try {
      // 2) 서버에 이벤트 기록
      await apiPost(
        "/api/trees/add/",
        { delta: 1, reason: cafeId ? `use:${cafeId}` : "use" },
        { auth: true }
      );

      // 3) 로컬 UX 로그 갱신
      const tk = todayKey();
      const userKey = dailyKeyFor(userName);
      const raw = localStorage.getItem(userKey);
      const map = raw ? JSON.parse(raw) : {};
      map[tk] = (map[tk] || 0) + 1;
      localStorage.setItem(userKey, JSON.stringify(map));
      setTodayUses(map[tk]);

      const graw = localStorage.getItem("global_uses_by_date");
      const gmap = graw ? JSON.parse(graw) : {};
      gmap[tk] = (gmap[tk] || 0) + 1;
      localStorage.setItem("global_uses_by_date", JSON.stringify(gmap));
      setGlobalDaily(gmap);

      // 4) 포인트 +4p (로컬)
      const newPts = points + 4;
      setPoints(newPts);
      localStorage.setItem(pointsKeyFor(userName), String(newPts));

      // 5) 서버 값으로 최종 동기화(낙관값과 차이나면 서버 기준으로 정정)
      await fetchTotals();

      // 6) 트랜잭션 저장 & 이동
      const txn = {
        time: nowStr(),
        bin: bin || "BIN-001",
        pointsGained: 4,
        userName,
        cafeId: cafeId || null,
      };
      sessionStorage.setItem("last_txn", JSON.stringify(txn));
      window.location.href = "/validating";
    } catch (e) {
      // ❗ 실패 시 낙관적 업데이트 롤백
      setMyTotal(beforeMyTotal);
      setGlobalTrees(beforeGlobalTrees);

      alert("사용 기록에 실패했습니다. 다시 시도해 주세요.");
      console.error(e);
    }
  };

  const useOnce = () => useOnceWithCafe(cafeParam || null);

  /* -------- 리워드(로컬) -------- */
  function redeemReward(reward) {
    if (!userName) return;
    if (points < reward.cost) {
      alert("포인트가 부족해요.");
      return;
    }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const entry = {
      id: `red_${Date.now()}`,
      userId: userName,
      cafeId: reward.cafeId,
      cafeName: reward.cafeName,
      rewardId: reward.id,
      title: reward.title,
      code,
      status: "issued",
      issuedAt: nowStr(),
      expireAt: Date.now() + REWARD_EXPIRE_HOURS * 60 * 60 * 1000,
    };
    const newPts = points - reward.cost;
    setPoints(newPts);
    localStorage.setItem(pointsKeyFor(userName), String(newPts));
    setRedeems((prev) => [entry, ...prev]);
    alert(`교환 완료!\n코드: ${code}\n${REWARD_EXPIRE_HOURS}시간 내 사용하세요.`);
  }
  const markRedeemed = (id) => setRedeems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "redeemed" } : r)));
  const deleteRedeem = (id) => setRedeems((prev) => prev.filter((r) => r.id !== id));

  /* ---------------- render ---------------- */
  return (
    <div>
      <Header title="대시보드" />
      <main className="dashboard-main">
        <section className="dashboard-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">
              {userName ? (
                <>
                  {userName}님,<br />
                  오늘도 한 그루 심어볼까요? 🌱
                </>
              ) : (
                "로그인이 필요합니다"
              )}
            </h2>

            {/* 상단 ‘나의 사용/포인트’ */}
            <div className="title-stats" aria-label="내 정보 요약">
              <div className="stat-chip">
                <span className="chip-label">나의 사용 횟수</span>
                <span className="chip-value">{myTotal}</span>
              </div>
              <div className="stat-chip">
                <span className="chip-label">나의 포인트</span>
                <span className="chip-value">{points+4}</span>
              </div>
            </div>

            <p className="section-sub">
              {userName ? (
                <>
                  쓰레기통을 사용할 때마다 +4p,<br />
                  우리의 숲이 더 푸르게 자라요.
                </>
              ) : (
                <>
                  회원가입 또는 로그인 후<br />
                  이용 기록/포인트를 확인할 수 있어요.
                </>
              )}
            </p>
          </div>

          {/* 숲 시각화 — 개인 */}
          <div className="forest-visual-container">
            <div className="forest-card forest-personal">
              <div className="forest-header">
                <h3 className="forest-title personal">나의 숲</h3>
                <span className="forest-chip personal">다음 나무까지 {personalPct}%</span>
              </div>

              <ForestField trees={treesPersonal} label="나의 숲" variant="light" />

              <div className="forest-stats">
                <div className="forest-metrics">
                  <div className="metric">
                    <div className="metric-label">내가 키운 나무</div>
                    <div className="metric-value">{treesPersonal}그루</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">오늘 내가 재활용한 컵</div>
                    <div className="metric-value">{todayUses+1}회</div>
                  </div>
                </div>
                <div className="progress">
                  <div className="progress-label">
                    <span>다음 나무까지</span>
                    <span>
                      {myTotal % PERSONAL_PER_TREE}/{PERSONAL_PER_TREE}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${personalPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 숲 시각화 — 커뮤니티 */}
            <div className="forest-card forest-global">
              <div className="forest-header">
                <h3 className="forest-title global">우리의 숲</h3>
                <div className="tabs" role="tablist" aria-label="기간 선택">
                  {["day", "week", "month"].map((k) => (
                    <button key={k} className={`tab-btn ${range === k ? "active" : ""}`} onClick={() => setRange(k)}>
                      {k === "day" ? "Day" : k === "week" ? "Week" : "Month"}
                    </button>
                  ))}
                </div>
              </div>

              <ForestField trees={treesCommunity} label="우리 모두의 숲" variant="dark" />

              <div className="forest-stats">
                <div className="forest-metrics">
                  <div className="metric metric-on-dark">
                    <div className="metric-label">함께 키운 나무</div>
                    <div className="metric-value">{treesCommunity}그루</div>
                  </div>
                  <div className="metric metric-on-dark">
                    <div className="metric-label">
                      {range === "day"
                        ? "오늘 재활용된 컵"
                        : range === "week"
                        ? "최근 7일"
                        : "최근 30일"}
                    </div>
                    <div className="metric-value">{communityRangeSum+1}</div>
                  </div>
                </div>

                {/* 전체 사용 누계(모든 사용자)의 진행률은 서버가 '전체 사용 횟수'를 안 주므로 표시 생략 */}
              </div>
            </div>
          </div>

          {/* 내가 ‘우리의 숲’에 기여한 성장도 문구 (앱 로컬 기준) */}
          <div className="daily-log">
            {userName ? (
              <>
                오늘 <b className="highlight-brand">{todayUses+1}</b>회 사용으로{" "}
                <b className="highlight-brand">우리의 숲</b>이{" "}
                <b className="highlight-brand">+{communityContributionPct}%</b> 성장했어요. <br />
                한 그루, 또 한 그루 함께 심어요!
              </>
            ) : (
              <>로그인하여 숲을 함께 키워보아요.</>
            )}
          </div>

          {/* 제휴 리워드 */}
          <RewardList points={points} onRedeem={reclaimSafe(redeemReward)} />

          {/* 내 쿠폰함 */}
          <CouponBox items={redeems} onUse={markRedeemed} onDelete={deleteRedeem} />

          {/* CTA */}
          <div className="cta-buttons">
            <Button onClick={useOnce}>
              {userName
                ? cafeParam
                  ? `쓰레기통 사용하기 (+1) · ${CAFES.find((c) => c.id === cafeParam)?.name || cafeParam}`
                  : "쓰레기통 사용하기 (+1)"
                : "로그인/가입 후 이용"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("로컬 대시보드 데이터를 초기화할까요? (서버 데이터는 유지)")) {
                  // 로컬 UX 데이터만 초기화(서버 누적은 그대로 유지)
                  localStorage.removeItem("global_uses_by_date");
                  sessionStorage.removeItem("last_txn");
                  localStorage.removeItem(dailyKeyFor(userName));
                  localStorage.removeItem(redemptionsKeyFor(userName));
                  localStorage.removeItem(pointsKeyFor(userName));
                  setGlobalDaily({});
                  setRedeems([]);
                  setTodayUses(0);
                  setPoints(0);
                  alert("로컬 데이터 초기화 완료");
                }
              }}
            >
              로컬 데이터 초기화
            </Button>
          </div>

          {(bin || cafeParam) && (
            <div className="bin-info">
              {bin && (
                <>
                  현재 QR 쓰레기통 ID: <strong className="highlight-brand">{bin}</strong>
                </>
              )}
              {cafeParam && (
                <>
                  <br />
                  제휴 카페:{" "}
                  <strong className="highlight-brand">
                    {CAFES.find((c) => c.id === cafeParam)?.name || cafeParam}
                  </strong>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* -------- 하위 컴포넌트 -------- */
function RewardList({ points, onRedeem }) {
  const partners = CAFES.filter((c) => c.partner);
  return (
    <div className="reward-list">
      <div className="list-head">
        <h3>제휴 카페 리워드</h3>
        <span className="my-points">
          보유 포인트: <b>{points+4}</b>p
        </span>
      </div>

      <div className="partner-scroller">
        {partners.map((cafe) => (
          <div key={cafe.id} className="partner-card">
            <div className="partner-title">{cafe.name}</div>
            <ul className="reward-badges">
              {REWARDS.map((r) => {
                const can = points >= r.cost;
                return (
                  <li key={`${cafe.id}-${r.id}`} className={`badge ${can ? "can" : "cannot"}`}>
                    <button
                      className="badge-btn"
                      onClick={() => can && onRedeem({ ...r, cafeId: cafe.id, cafeName: cafe.name })}
                      disabled={!can}
                      title={can ? `${r.title} 교환하기` : "포인트가 부족합니다"}
                      aria-label={`${r.tier} (${r.cost}p) - ${r.title}${can ? "" : " (포인트 부족)"}`}
                    >
                      <span className="badge-top">
                        {r.tier} · {r.cost}p
                      </span>
                      <span className="badge-sub">{r.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function CouponBox({ items, onUse, onDelete }) {
  if (!items?.length) return null;
  return (
    <div className="coupon-box">
      <div className="list-head">
        <h3>내 쿠폰함</h3>
        <span className="sub-hint">만료까지 최대 {REWARD_EXPIRE_HOURS}시간</span>
      </div>
      <div className="coupon-list">
        {items.map((it) => {
          const remain = it.expireAt - Date.now();
          const hh = Math.max(0, Math.floor(remain / (1000 * 60 * 60)));
          const mm = Math.max(0, Math.floor((remain % (1000 * 60 * 60)) / (1000 * 60)));
          const ss = Math.max(0, Math.floor((remain % (1000 * 60)) / 1000));
          return (
            <div key={it.id} className={`coupon-card status-${it.status}`}>
              <div className="coupon-main">
                <div className="coupon-title">{it.title}</div>
                <div className="coupon-sub">
                  {it.cafeName} • 코드 <b>{it.code}</b>
                </div>
              </div>
              <div className="coupon-side">
                {it.status === "issued" && remain > 0 && (
                  <div className="countdown" aria-label="만료까지 남은 시간">
                    {hh}h {mm}m {ss}s
                  </div>
                )}
                {it.status !== "issued" && <div className="chip">{it.status === "redeemed" ? "사용됨" : "만료"}</div>}
                <div className="coupon-actions">
                  {it.status === "issued" && remain > 0 && (
                    <Button size="sm" onClick={() => onUse(it.id)}>
                      사용 완료
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onDelete(it.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------- 유틸: 안전 래퍼 -------- */
function reclaimSafe(fn) {
  // onClick에서 falsey guard를 붙이는 패턴을 함수형으로 래핑
  return (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      console.error(e);
      alert("작업 중 오류가 발생했어요. 다시 시도해 주세요.");
      return undefined;
    }
  };
}
