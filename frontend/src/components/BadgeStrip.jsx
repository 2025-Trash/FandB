import React from "react";
import "./BadgeStrip.css";

const MILESTONES = [1, 5, 10, 20];

export default function BadgeStrip({ trees = 0 }) {
  return (
    <div className="bdg-strip">
      <div className="bdg-title">마일스톤</div>
      <div className="bdg-list">
        {MILESTONES.map((m) => {
          const unlocked = trees >= m;
          return (
            <div key={m} className={`bdg ${unlocked ? "bdg--on" : ""}`} title={`${m}그루 달성`}>
              <span className="bdg-medal">🏅</span>
              <span className="bdg-text">{m}그루</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
