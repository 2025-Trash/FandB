import styled from "styled-components";

const Label = styled.label`
  display: block;
`;
const Title = styled.div`
  margin-bottom: 6px; font-size: 12px; font-weight: 800; color: #2F3036;
`;
const Field = styled.input`
  height: 48px; width: 100%;
  border: 1px solid #C5C6CC; border-radius: 12px;
  padding: 0 12px; transition: border-color .15s ease, box-shadow .15s ease;
  &:focus {
    border-color: var(--brand);
    box-shadow: 0 0 0 4px rgba(45,204,112,0.18);
  }
`;

export default function InputField({ label, ...props }) {
  return (
    <Label>
      <Title>{label}</Title>
      <Field {...props} />
    </Label>
  );
}
