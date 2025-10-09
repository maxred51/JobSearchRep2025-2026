import React from "react";
import { Link } from "react-router-dom";
import "../styles/components/AdminHeader.css";

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="logo">Logo firmy</div>
      <div className="admin-header-right">
        <div className="font-controls">
          <button className="font-btn">A+</button>
          <button className="font-btn">A-</button>
        </div>
        <span className="admin-mode">Tryb Administratora</span>
        <div className="icons">
          <span className="icon">🔔</span>
        </div>
        <Link to="/settings" className="settings-link">Ustawienia konta</Link>
        <Link to="/login" className="logout-link">Wyloguj się</Link>
      </div>
    </header>
  );
}
