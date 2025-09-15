import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Button from "../components/Button";
import "./Dashboard.css";

/* ---------------- helpers ---------------- */
function getUser() {
  const raw = localStorage.getItem("demo_user");
  return raw ? JSON.parse(raw) : null;
}
function setUser(u) { localStorage.setItem("demo_user", JSON.stringify(u)); }

function getGlobal() {
  const raw = localStorage.getItem("global_stats");
  return raw ? JSON.parse(raw) : { totalUses: 0, totalPoints: 0 };
}
function setGlobal(g) { localStorage.setItem("global_stats", JSON.stringify(g)); }

function getGlobalDaily() {
  const raw = localStorage.getItem("global_uses_by_date");
  return raw ? JSON.parse(raw) : {};
}
function setGlobalDaily(map) { localStorage.setItem("global_uses_by_date", JSON.stringify(map)); }

function nowStr() {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const todayKey = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
};
const dailyKeyFor = (user) => `uses_by_date_${user?.name || "guest"}`;
const redemptionsKeyFor = (user) => `redemptions_${user?.name || "guest"}`;

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
  { id:"bronze", tier:"Bronze", cost:40,  title:"10% OFF 쿠폰", type:"coupon" },
  { id:"silver", tier:"Silver", cost:80,  title:"사이즈업 쿠폰", type:"coupon" },
  { id:"gold",   tier:"Gold",   cost:120, title:"₩1,000 할인", type:"coupon" },
];

/* ===== 조정 가능한 상수 ===== */
const PERSONAL_PER_TREE = 10;   // 개인: 10회 = 1그루
const COMMUNITY_PER_TREE = 30;  // 커뮤니티: 30회 = 1그루
const REWARD_EXPIRE_HOURS = 48;

function clampPct(n) { return Math.max(0, Math.min(100, Math.round(n))); }

/* ================= ForestField =================
  넓은 잔디 배경에 작은 나무(🌳)를 “그루 수”만큼 렌더링합니다.
  - trees: 그루 수(=이모지 개수)
  - cap: 렌더 상한 (초과분은 +N으로 표시)
  - size: 이모지 크기(px)
*/
function ForestField({ trees = 0, cap = 300, size = 18, label, variant = "light" }) {
  const count = Math.min(trees, cap);
  const overflow = Math.max(0, trees - cap);

  return (
    <div className={`field-wrap ${variant}`} aria-label={label || "forest"}>
      <div className="field-grass">
        <div className="field-grid" style={{ fontSize: `${size}px` }}>
          {Array.from({ length: count }).map((_, i) => (
            <span className="tree" key={i} role="img" aria-label="tree">🌳</span>
          ))}
        </div>
        {overflow > 0 && (
          <div className="field-overflow">+{overflow}</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- main component ---------------- */
export default function Dashboard({ bin }) {
  const [user, setUserState] = useState(getUser());
  const [global, setGlobalState] = useState(getGlobal());
  const [globalDaily, setGlobalDailyState] = useState(getGlobalDaily());

  const [todayUses, setTodayUses] = useState(0);
  const [range, setRange] = useState("day"); // day/week/month

  // URL cafe param
  const [cafeParam, setCafeParam] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cafe = params.get("cafe");
    if (cafe) setCafeParam(cafe);
  }, []);

  // daily counts
  useEffect(() => {
    if (!user) return;
    const mapRaw = localStorage.getItem(dailyKeyFor(user));
    const map = mapRaw ? JSON.parse(mapRaw) : {};
    setTodayUses(map[todayKey()] || 0);
  }, [user]);

  useEffect(() => {
    const gd = getGlobalDaily();
    setGlobalDailyState(gd);
  }, []);

  // redemptions
  const [redeems, setRedeems] = useState(() => {
    const raw = localStorage.getItem(redemptionsKeyFor(user));
    return raw ? JSON.parse(raw) : [];
  });
  useEffect(() => {
    localStorage.setItem(redemptionsKeyFor(user), JSON.stringify(redeems));
  }, [redeems, user]);
  useEffect(() => {
    const t = setInterval(() => {
      setRedeems((prev) => prev.map(r => (r.status === "issued" && Date.now() > r.expireAt) ? { ...r, status: "expired" } : r));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  /* --------- 핵심 수치 계산 --------- */
  // “그루 수” 계산
  const treesPersonal = useMemo(
    () => Math.floor((user?.uses || 0) / PERSONAL_PER_TREE),
    [user]
  );
  const treesCommunity = useMemo(
    () => Math.floor(global.totalUses / COMMUNITY_PER_TREE),
    [global.totalUses]
  );

  // 다음 그루까지 진행도
  const personalMod = (user?.uses || 0) % PERSONAL_PER_TREE;
  const personalPct = clampPct((personalMod / PERSONAL_PER_TREE) * 100);
  const communityMod = global.totalUses % COMMUNITY_PER_TREE;
  const communityPct = clampPct((communityMod / COMMUNITY_PER_TREE) * 100);

  // 기간 합계 (커뮤니티)
  const communityRangeSum = useMemo(() => {
    const today = new Date(todayKey());
    const days = range === "day" ? 1 : range === "week" ? 7 : 30;
    let sum = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      sum += globalDaily[key] || 0;
    }
    return sum;
  }, [globalDaily, range]);

  // ✅ 내가 오늘 올린 ‘우리의 숲’ 성장 기여도(%) = 오늘 내 사용 / 커뮤니티 1그루 기준
  const communityContributionPct = clampPct((todayUses / COMMUNITY_PER_TREE) * 100);

  /* -------- 쓰레기통 사용 -------- */
  const useOnceWithCafe = (cafeId) => {
    if (!user) { window.location.href = "/signup"; return; }

    // 1) 개인 적립
    let newUser = { ...user, uses: user.uses + 1, points: user.points + 4 };

    // 2) 카페 스탬프 (옵션)
    const stamps = { ...(newUser.stamps || {}) };
    if (cafeId) stamps[cafeId] = (stamps[cafeId] || 0) + 1;
    newUser.stamps = stamps;

    // 3) 저장(개인/전체)
    setUser(newUser); setUserState(newUser);
    const newGlobal = { totalUses: global.totalUses + 1, totalPoints: global.totalPoints + 4 };
    setGlobal(newGlobal); setGlobalState(newGlobal);

    // 4) 개인/전체 일일 로그
    const tk = todayKey();

    const k = dailyKeyFor(newUser);
    const raw = localStorage.getItem(k);
    const map = raw ? JSON.parse(raw) : {};
    map[tk] = (map[tk] || 0) + 1;
    localStorage.setItem(k, JSON.stringify(map));
    setTodayUses(map[tk]);

    const gmap = getGlobalDaily();
    gmap[tk] = (gmap[tk] || 0) + 1;
    setGlobalDaily(gmap);
    setGlobalDailyState(gmap);

    // 5) 트랜잭션
    const txn = { time: nowStr(), bin: bin || "BIN-001", pointsGained: 4, userName: newUser.name, cafeId: cafeId || null };
    sessionStorage.setItem("last_txn", JSON.stringify(txn));

    // 6) 유효성 페이지로 이동
    window.location.href = "/validating";
  };

  const useOnce = () => useOnceWithCafe(cafeParam || null);

  /* -------- 리워드 -------- */
  function redeemReward(reward) {
    if (!user) return;
    if (user.points < reward.cost) { alert("포인트가 부족해요."); return; }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const entry = {
      id: `red_${Date.now()}`,
      userId: user.id || user.name || "me",
      cafeId: reward.cafeId,
      cafeName: reward.cafeName,
      rewardId: reward.id,
      title: reward.title,
      code,
      status: "issued",
      issuedAt: nowStr(),
      expireAt: Date.now() + REWARD_EXPIRE_HOURS * 60 * 60 * 1000,
    };
    const newUser = { ...user, points: user.points - reward.cost };
    setUser(newUser); setUserState(newUser);
    setRedeems((prev) => [entry, ...prev]);
    alert(`교환 완료!\n코드: ${code}\n${REWARD_EXPIRE_HOURS}시간 내 사용하세요.`);
  }
  const markRedeemed = (id) => setRedeems(prev => prev.map(r => r.id === id ? { ...r, status: "redeemed" } : r));
  const deleteRedeem = (id) => setRedeems(prev => prev.filter(r => r.id !== id));

  /* ---------------- render ---------------- */
  return (
    <div>
      <Header title="대시보드" />
      <main className="dashboard-main">
        <section className="dashboard-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">
              {user
                ? (
                  <>
                    {user.name}님,<br />
                    오늘도 한 그루 심어볼까요? 🌱
                  </>
                )
                : "로그인이 필요합니다"}
            </h2>

            {/* ✅ 상단에 ‘나의 사용/포인트’ 칩 배치 */}
            <div className="title-stats" aria-label="내 정보 요약">
              <div className="stat-chip">
                <span className="chip-label">나의 사용 횟수</span>
                <span className="chip-value">{user?.uses ?? 0}</span>
              </div>
              <div className="stat-chip">
                <span className="chip-label">나의 포인트</span>
                <span className="chip-value">{user?.points ?? 0}</span>
              </div>
            </div>

            <p className="section-sub">
              {user ? (
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

          {/* 숲 시각화 — 개인(라이트) */}
          <div className="forest-visual-container">
            <div className="forest-card forest-personal">
              <div className="forest-header">
                <h3 className="forest-title personal">나의 숲</h3>
                <span className="forest-chip personal">다음 나무까지 {personalPct}%</span>
              </div>

              <ForestField
                trees={treesPersonal}
                label="나의 숲"
                variant="light"
              />

              <div className="forest-stats">
                <div className="forest-metrics">
                  <div className="metric">
                    <div className="metric-label">내가 키운 나무</div>
                    <div className="metric-value">{treesPersonal}그루</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">오늘 내가 재활용한 컵</div>
                    <div className="metric-value">{todayUses}회</div>
                  </div>
                </div>
                <div className="progress">
                  <div className="progress-label">
                    <span>다음 나무까지</span>
                    <span>{(user?.uses || 0) % PERSONAL_PER_TREE}/{PERSONAL_PER_TREE}</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${personalPct}%` }} /></div>
                </div>
              </div>
            </div>

            {/* 숲 시각화 — 커뮤니티(다크) */}
            <div className="forest-card forest-global">
              <div className="forest-header">
                <h3 className="forest-title global">우리의 숲</h3>
                <div className="tabs" role="tablist" aria-label="기간 선택">
                  {["day","week","month"].map(k => (
                    <button key={k} className={`tab-btn ${range===k?"active":""}`} onClick={()=>setRange(k)}>
                      {k==="day"?"Day":k==="week"?"Week":"Month"}
                    </button>
                  ))}
                </div>
              </div>

              <ForestField
                trees={treesCommunity}
                label="우리 모두의 숲"
                variant="dark"
              />

              <div className="forest-stats">
                <div className="forest-metrics">
                  <div className="metric metric-on-dark">
                    <div className="metric-label">함께 키운 나무</div>
                    <div className="metric-value">{treesCommunity}그루</div>
                  </div>
                  <div className="metric metric-on-dark">
                    <div className="metric-label">
                      {range==="day"?"오늘 재활용된 컵":range==="week"?"최근 7일": "최근 30일"}
                    </div>
                    <div className="metric-value">{communityRangeSum}</div>
                  </div>
                </div>

                <div className="progress progress-on-dark">
                  <div className="progress-label">
                    <span>다음 나무까지</span>
                    <span>{global.totalUses % COMMUNITY_PER_TREE}/{COMMUNITY_PER_TREE}</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${communityPct}%` }} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* 내가 ‘우리의 숲’에 기여한 성장도 문구 */}
          <div className="daily-log">
            {user
              ? <>오늘 <b className="highlight-brand">{todayUses}</b>회 사용으로 <b className="highlight-brand">우리의 숲</b>이 <b className="highlight-brand">+{communityContributionPct}%</b> 성장했어요. <br />한 그루, 또 한 그루 함께 심어요!</>
              : <>로그인하여 숲을 함께 키워보아요.</>}
          </div>

          {/* 제휴 리워드 */}
          <RewardList user={user} onRedeem={redeemReward} />

          {/* 내 쿠폰함 */}
          <CouponBox items={redeems} onUse={markRedeemed} onDelete={deleteRedeem} />

          {/* CTA */}
          <div className="cta-buttons">
            <Button onClick={useOnce}>
              {user ? (cafeParam ? `쓰레기통 사용하기 (+1) · ${CAFES.find(c => c.id === cafeParam)?.name || cafeParam}` : "쓰레기통 사용하기 (+1)") : "로그인/가입 후 이용"}
            </Button>
            <Button variant="outline" onClick={()=>{
              if (window.confirm("데모 데이터를 초기화할까요?")) {
                localStorage.removeItem("demo_user");
                localStorage.removeItem("global_stats");
                localStorage.removeItem("global_uses_by_date");
                sessionStorage.removeItem("last_txn");
                if (user) {
                  localStorage.removeItem(dailyKeyFor(user));
                }
                localStorage.removeItem(redemptionsKeyFor(user));
                setUserState(null);
                setGlobalState({ totalUses: 0, totalPoints: 0 });
                setGlobalDailyState({});
                setRedeems([]);
                setTodayUses(0);
                alert("초기화 완료");
              }
            }}>데모 데이터 초기화</Button>
          </div>

          {(bin || cafeParam) && (
            <div className="bin-info">
              {bin && <>현재 QR 쓰레기통 ID: <strong className="highlight-brand">{bin}</strong></>}
              {cafeParam && <><br/>제휴 카페: <strong className="highlight-brand">{CAFES.find(c=>c.id===cafeParam)?.name || cafeParam}</strong></>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* -------- 하위 컴포넌트 -------- */
function RewardList({ user, onRedeem }) {
  const userPoints = user?.points ?? 0;
  const partners = CAFES.filter(c => c.partner);
  return (
    <div className="reward-list">
      <div className="list-head">
        <h3>제휴 카페 리워드</h3>
        <span className="my-points">보유 포인트: <b>{userPoints}</b>p</span>
      </div>

      <div className="partner-scroller">
        {partners.map(cafe => (
          <div key={cafe.id} className="partner-card">
            <div className="partner-title">{cafe.name}</div>
            <ul className="reward-badges">
              {REWARDS.map(r => {
                const can = userPoints >= r.cost;
                return (
                  <li key={`${cafe.id}-${r.id}`} className={`badge ${can ? "can" : "cannot"}`}>
                    <button
                      className="badge-btn"
                      onClick={() => can && onRedeem({ ...r, cafeId: cafe.id, cafeName: cafe.name })}
                      disabled={!can}
                      title={can ? `${r.title} 교환하기` : "포인트가 부족합니다"}
                      aria-label={`${r.tier} (${r.cost}p) - ${r.title}${can ? "" : " (포인트 부족)"}`}
                    >
                      <span className="badge-top">{r.tier} · {r.cost}p</span>
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
        {items.map(it => {
          const remain = it.expireAt - Date.now();
          const hh = Math.max(0, Math.floor(remain / (1000 * 60 * 60)));
          const mm = Math.max(0, Math.floor((remain % (1000 * 60 * 60)) / (1000 * 60)));
          const ss = Math.max(0, Math.floor((remain % (1000 * 60)) / 1000));
          return (
            <div key={it.id} className={`coupon-card status-${it.status}`}>
              <div className="coupon-main">
                <div className="coupon-title">{it.title}</div>
                <div className="coupon-sub">{it.cafeName} • 코드 <b>{it.code}</b></div>
              </div>
              <div className="coupon-side">
                {it.status === "issued" && remain > 0 && (
                  <div className="countdown" aria-label="만료까지 남은 시간">
                    {hh}h {mm}m {ss}s
                  </div>
                )}
                {it.status !== "issued" && (
                  <div className="chip">{it.status === "redeemed" ? "사용됨" : "만료"}</div>
                )}
                <div className="coupon-actions">
                  {it.status === "issued" && remain > 0 && (
                    <Button size="sm" onClick={() => onUse(it.id)}>사용 완료</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onDelete(it.id)}>삭제</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
