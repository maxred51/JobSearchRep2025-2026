<<<<<<< HEAD
import React from "react";
import "../styles/components/EmployeeSidebar.css";

export default function EmployeeSidebar({ active }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className={active === "offers" ? "active" : ""}>
            <a href="/employee">Moje oferty</a>
          </li>
          <li className={active === "candidates" ? "active" : ""}>
            <a href="/candidates">Kandydaci</a>
          </li>
          <li className={active === "applications" ? "active" : ""}>
            <a href="/applicationoverview">Aplikacje</a>
          </li>
          <li className={active === "categories" ? "active" : ""}>
            <a href="/categories">Kategorie</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
=======
import React from "react";
import "../styles/components/EmployeeSidebar.css";

export default function EmployeeSidebar({ active }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className={active === "offers" ? "active" : ""}>
            <a href="/employee">Moje oferty</a>
          </li>
          <li className={active === "candidates" ? "active" : ""}>
            <a href="/candidates">Kandydaci</a>
          </li>
          <li className={active === "applications" ? "active" : ""}>
            <a href="/applicationoverview">Aplikacje</a>
          </li>
          <li className={active === "categories" ? "active" : ""}>
            <a href="/categories">Kategorie</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
>>>>>>> def9ccd (Poprawki)
