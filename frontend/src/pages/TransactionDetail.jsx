import Header from "../components/Header";

const Row = ({label, value}) => (
  <div style={{
    display: "flex", justifyContent: "space-between", padding: "10px 0",
    borderBottom: "1px solid var(--line)"
  }}>
    <div style={{ color: "#737B7D", fontWeight: 700, fontSize: 12 }}>{label}</div>
    <div style={{ color: "#737B7D", fontSize: 12 }}>{value}</div>
  </div>
);

export default function TransactionDetail(){
  const txn = JSON.parse(sessionStorage.getItem("last_txn") || "{}");
  return (
    <div>
      <Header title="Transaction Detail" back backHref="/dashboard" />
      <main style={{ maxWidth: 768, padding: 16, margin: "0 auto 64px" }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign: "center", color: "var(--brand)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            You gain +4 Points
          </div>
          <div style={{ borderTop: "1px solid #000", margin: "12px 0" }} />

          <Row label="사용 일시" value={txn.time || "-"} />
          <Row label="쓰레기통 ID" value={txn.bin || "-"} />
          <Row label="적립 포인트" value={txn.pointsGained ?? 4} />
          <Row label="사용자" value={txn.userName || "-"} />
        </div>

        <div style={{
          marginTop: 16, background: "#fff", border: "1px solid #868889", borderRadius: 12, padding: 16,
          textAlign: "center", color: "#737B7D", fontWeight: 700, fontSize: 13
        }}>
          영수증 공유(데모)
        </div>
      </main>
    </div>
  );
}
