import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import { FontContext } from "../context/FontContext";

export default function Header() {
  const { increaseFont, decreaseFont } = useContext(FontContext);

  return (
    <header className="dashboard-header">
      <div className="logo"></div>
      <div className="header-right">
        <div className="font-controls">
          <button className="font-btn" onClick={increaseFont}>A+</button>
          <button className="font-btn" onClick={decreaseFont}>A-</button>
        </div>
        <span className="welcome">Witaj, pracowniku</span>
        <Link to="/settings" className="settings-link">Ustawienia konta</Link>
        <Link to="/login" className="logout-link">Wyloguj się</Link>
      </div>
    </header>
  );
}
