import styled from "styled-components";

const Bar = styled.header`
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  height: 56px; background: #fff; border-bottom: 1px solid var(--line);
`;

const Back = styled.a`
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--text);
`;

export default function Header({ title, back = false, backHref = "/" }) {
  return (
    <Bar>
      {back && <Back href={backHref} aria-label="뒤로가기">←</Back>}
      <strong style={{ color: "var(--brand)" }}>{title}</strong>
    </Bar>
  );
}
