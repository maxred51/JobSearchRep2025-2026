import React from "react";
import { Link } from "react-router-dom";
import "../styles/components/Header.css";

export default function Header() {
  return (
    <header className="dashboard-header">
      <div className="logo">Logo firmy</div>
      <div className="header-right">
        <button className="font-btn">A+</button>
        <button className="font-btn">A-</button>
        <span className="welcome">Witaj, kandydacie</span>
        <span className="notifications">🔔</span>
        <Link to="/settings" className="settings-link">Ustawienia konta</Link>
        <Link to="/login" className="logout-link">Wyloguj się</Link>
      </div>
    </header>
  );
}
