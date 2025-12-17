import { createContext, useState } from "react";

export const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(16);

  const increaseFont = () => setFontSize(prev => Math.min(prev + 2, 36));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 2, 10));

  return (
    <FontContext.Provider value={{ fontSize, increaseFont, decreaseFont }}>
      {children}
    </FontContext.Provider>
  );
};
