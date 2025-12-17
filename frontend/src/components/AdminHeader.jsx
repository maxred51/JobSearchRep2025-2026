import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/components/AdminHeader.css";
import { FontContext } from "../context/FontContext";

export default function AdminHeader() {
  const { increaseFont, decreaseFont } = useContext(FontContext);

  return (
    <header className="admin-header">
      <div className="logo"></div>
      <div className="admin-header-right">
        <div className="font-controls">
          <button className="font-btn" onClick={increaseFont}>A+</button>
          <button className="font-btn" onClick={decreaseFont}>A-</button>
        </div>
        <span className="admin-mode">Tryb Administratora</span>
        <Link to="/settings" className="settings-link">Ustawienia konta</Link>
        <Link to="/login" className="logout-link">Wyloguj się</Link>
      </div>
    </header>
  );
}
