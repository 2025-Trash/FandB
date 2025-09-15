import React, { useMemo } from "react";
import stage1 from "../assets/trees/tree-1.png"; // 새싹
import stage2 from "../assets/trees/tree-2.png"; // 중간
import stage3 from "../assets/trees/tree-3.png"; // 완성
import "./TreeGarden.css";

const STAGES = [stage1, stage2, stage3];

export default function TreeGarden({
  uses = 0,            // 개인 또는 커뮤니티 사용 횟수
  perTree = 30,       // 몇 회당 1그루인지
  label = "숲",
  maxColumns = 6,      // 그리드 열 개수
}) {
  const trees = Math.floor(uses / perTree);
  const progress = uses % perTree;
  const pct = Math.min(100, Math.round((progress / perTree) * 100));

  const stageIdx = useMemo(() => (pct >= 67 ? 2 : pct >= 34 ? 1 : 0), [pct]);

  const nodes = useMemo(() => {
    const finished = Array.from({ length: trees }, () => STAGES[2]);
    const growing = progress > 0 ? [STAGES[stageIdx]] : [];
    return [...finished, ...growing];
  }, [trees, progress, stageIdx]);

  return (
    <section className="tg-card">
      <div className="tg-head">
        <div className="tg-title">{label}</div>
        <div className="tg-sub">
          총 <b className="tg-strong">{trees}</b> 그루
          {progress > 0 && <> · 다음 나무까지 <b className="tg-strong">{perTree - progress}</b>회</>}
        </div>
      </div>

      <div
        className="tg-grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(maxColumns, Math.max(2, nodes.length || 2))}, 1fr)` }}
      >
        {nodes.length === 0 ? (
          <div className="tg-empty">첫 번째 나무를 키워볼까요? 🌱</div>
        ) : (
          nodes.map((img, i) => (
            <div key={i} className={`tg-tree ${i < trees ? "tg-tree--done" : "tg-tree--growing"}`}>
              <img src={img} alt="tree" />
            </div>
          ))
        )}
      </div>

      <div className="tg-progress-wrap" aria-label="다음 나무까지 진행도">
        <div className="tg-progress-bar">
          <div className="tg-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="tg-progress-text">{pct}%</div>
      </div>
    </section>
  );
}
