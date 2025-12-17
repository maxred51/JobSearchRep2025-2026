import React from "react";
import AppRouter from "./router/AppRouter.jsx";
import { FontProvider } from "./context/FontContext";
import MainWrapper from "./components/MainWrapper.jsx";

function App() {
  return (
    <FontProvider>
      <MainWrapper>
        <AppRouter />
      </MainWrapper>
    </FontProvider>
  );
}

export default App;
