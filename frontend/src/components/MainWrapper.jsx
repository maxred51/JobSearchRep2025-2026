import React, { useContext } from "react";
import { FontContext } from "../context/FontContext";

export default function MainWrapper({ children }) {
  const { fontSize } = useContext(FontContext);

  return (
    <div style={{ fontSize: `${fontSize}px` }}>
      {children}
    </div>
  );
}
