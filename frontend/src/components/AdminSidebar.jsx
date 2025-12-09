import React from "react";
import "../styles/components/AdminSidebar.css";

export default function AdminSidebar({ active }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className={active === "users" ? "active" : ""}>
            <a href="/admin">Użytkownicy</a>
          </li>
          <li className={active === "jobs" ? "active" : ""}>
            <a href="/offersadmin">Oferty pracy</a>
          </li>
          <li className={active === "notifications" ? "active" : ""}>
            <a href="/notifications">Powiadomienia</a>
          </li>
          <li className={active === "stats" ? "active" : ""}>
            <a href="/stats">Statystyki</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
