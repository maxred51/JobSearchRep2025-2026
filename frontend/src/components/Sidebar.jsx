<<<<<<< HEAD
import React from "react";
import "../styles/components/Sidebar.css";

export default function CandidateSidebar({ active }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className={active === "overview" ? "active" : ""}>
            <a href="/">Przegląd ofert</a>
          </li>
          <li className={active === "applications" ? "active" : ""}>
            <a href="/applications">Moje aplikacje</a>
          </li>
          <li className={active === "offers" ? "active" : ""}>
            <a href="/offers">Obserwowane firmy i oferty</a>
          </li>
          <li className={active === "cv" ? "active" : ""}>
            <a href="/cv">Moje CV</a>
          </li>
          <li className={active === "opinions" ? "active" : ""}>
            <a href="/opinions">Moje opinie</a>
          </li>
          <li className={active === "communication" ? "active" : ""}>
            <a href="/communication">Historia komunikacji</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
=======
import React from "react";
import "../styles/components/Sidebar.css";

export default function CandidateSidebar({ active }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className={active === "overview" ? "active" : ""}>
            <a href="/">Przegląd ofert</a>
          </li>
          <li className={active === "applications" ? "active" : ""}>
            <a href="/applications">Moje aplikacje</a>
          </li>
          <li className={active === "offers" ? "active" : ""}>
            <a href="/offers">Obserwowane firmy i oferty</a>
          </li>
          <li className={active === "cv" ? "active" : ""}>
            <a href="/cv">Moje CV</a>
          </li>
          <li className={active === "opinions" ? "active" : ""}>
            <a href="/opinions">Moje opinie</a>
          </li>
          <li className={active === "communication" ? "active" : ""}>
            <a href="/communication">Historia komunikacji</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
>>>>>>> def9ccd (Poprawki)
