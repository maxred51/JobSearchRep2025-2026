import React from "react";
import "../../styles/candidate/JobOfferPreview.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

function JobOfferPreview() {
  return (
    <div className="dashboard-wrapper">
      <Header />

      <div className="dashboard-content">

        <main className="offer-section">
          <h2 className="offer-title">Tytuł oferty</h2>

          <p><b>Nazwa firmy:</b> loremipsum</p>
          <p><b>Opis stanowiska:</b> loremipsum loremipsum</p>

          <div className="offer-block">
            <b>Zadania stanowiska:</b>
            <ul>
              <li><input type="checkbox" /> loremipsum</li>
              <li><input type="checkbox" /> loremipsum</li>
            </ul>
          </div>

          <div className="offer-block">
            <b>Niezbędne wymagania stanowiska:</b>
            <p>loremipsum</p>
          </div>

          <div className="offer-block">
            <b>Mile widziane wymagania stanowiska:</b>
            <ul>
              <li><input type="checkbox" /> loremipsum</li>
            </ul>
          </div>

          <div className="offer-block">
            <b>Korzyści z pracy:</b>
            <ul>
              <li><input type="checkbox" /> loremipsum</li>
            </ul>
          </div>

          <div className="offer-block">
            <b>Dodatkowe informacje:</b>
            <p>loremipsum</p>
          </div>

          <div className="offer-footer">
            <img
              src="https://i.ibb.co/JxzWwZV/beaver.png"
              alt="Maskotka firmy"
              className="offer-image"
            />
            <div className="offer-links">
              <a href="/" className="back-link">Powrót do strony głównej</a>
              <a href="/apply" className="apply-link">Aplikuj na ofertę</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default JobOfferPreview;
