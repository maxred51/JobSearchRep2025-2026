import React from "react";
import "../../styles/candidate/CandidateDashboard.css";
import CandidateSidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function CandidateDashboard() {
  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        <CandidateSidebar active="overview" />

        <main className="main-content">
          <section className="offers-section">
            <div className="search-bar">
              <input type="text" placeholder="Szukaj ofert..." />
              <select>
                <option>Kategoria</option>
                <option>IT</option>
                <option>Sprzedaż</option>
                <option>Produkcja</option>
              </select>
              <input type="text" placeholder="Lokalizacja" />
              <button className="search-btn">🔍</button>
            </div>

            <div className="offers-list">
              <div className="offer">
                <span className="offer-title">Magazynier FERRO S.A. Zabrze</span>
                <div className="offer-actions">
                  <span className="star">☆</span>
                  <a href="/offerpreview" className="apply-link">Aplikuj</a>
                </div>
              </div>

              <div className="offer">
                <span className="offer-title">Sprzedawca/Kasjer Kaufland Ząbkowice Śląskie</span>
                <div className="offer-actions">
                  <span className="star">☆</span>
                  <a href="/offerpreview" className="apply-link">Aplikuj</a>
                </div>
              </div>

              <div className="offer">
                <span className="offer-title">Cukiernik Kłos Piekarnia Łódź</span>
                <div className="offer-actions">
                  <span className="star">☆</span>
                  <a href="/offerpreview" className="apply-link">Aplikuj</a>
                </div>
              </div>

              <div className="offer">
                <span className="offer-title">Data Engineer ITDS Polska Kraków</span>
                <div className="offer-actions">
                  <span className="star">☆</span>
                  <a href="/offerpreview" className="apply-link">Aplikuj</a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="filters">
          <div className="filter-group">
            <h4>Poziom stanowiska</h4>
            <label><input type="checkbox" /> Junior</label>
            <label><input type="checkbox" /> Senior</label>
          </div>

          <div className="filter-group">
            <h4>Wymiar pracy</h4>
            <label><input type="checkbox" /> Pełny etat</label>
            <label><input type="checkbox" /> Część etatu</label>
          </div>

          <div className="filter-group">
            <h4>Tryb pracy</h4>
            <label><input type="checkbox" /> Stacjonarna</label>
            <label><input type="checkbox" /> Zdalna</label>
          </div>

          <div className="filter-group">
            <h4>Umowa</h4>
            <label><input type="checkbox" /> Umowa o pracę</label>
            <label><input type="checkbox" /> B2B</label>
          </div>
        </aside>
      </div>
    </div>
  );
}
