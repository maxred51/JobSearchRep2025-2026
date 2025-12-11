<<<<<<< HEAD
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  return (
    <header className="dashboard-header">
      <div className="logo"></div>
      <div className="header-right">
        <button className="font-btn">A+</button>
        <button className="font-btn">A-</button>
        <span className="welcome">Witaj, pracowniku</span>
        <span className="notifications">🔔</span>
        <Link to="/settings" className="settings-link">Ustawienia konta</Link>
        <Link to="/login" className="logout-link">Wyloguj się</Link>
      </div>
    </header>
  );
}
=======
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  return (
    <header className="dashboard-header">
      <div className="logo"></div>
      <div className="header-right">
        <button className="font-btn">A+</button>
        <button className="font-btn">A-</button>
        <span className="welcome">Witaj, pracowniku</span>
        <span className="notifications">🔔</span>
        <Link to="/settings" className="settings-link">Ustawienia konta</Link>
        <Link to="/login" className="logout-link">Wyloguj się</Link>
      </div>
    </header>
  );
}
>>>>>>> def9ccd (Poprawki)
