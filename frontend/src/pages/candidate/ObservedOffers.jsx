import React from "react";
import "../../styles/candidate/ObservedOffers.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

function ObservedOffers() {
  return (
    <div className="dashboard-wrapper">
      <Header />

      <div className="dashboard-content">
        <Sidebar />

        <main className="offers-section">
          <section className="observed-companies">
            <h3>Obserwowane firmy</h3>

            <div className="company">
              <div className="company-header">
                <strong>Firma A</strong>
                <button className="unfollow">Nie obserwuj</button>
              </div>
              <p>Oferta 1</p>
              <p>Oferta 2</p>
              <p>Kurs</p>
              <p>Certyfikat</p>
              <p>Rekomendacje</p>
            </div>

            <div className="company">
              <div className="company-header">
                <strong>Firma B</strong>
                <button className="unfollow">Nie obserwuj</button>
              </div>
              <p>Oferta 1</p>
              <p>Oferta 2</p>
              <p>Kurs</p>
              <p>Certyfikat</p>
              <p>Rekomendacje</p>
            </div>
          </section>

          <section className="saved-offers">
            <h3>Zapisane oferty</h3>

            <div className="offer">
              <div className="offer-header">
                <strong>Oferta 1</strong>
                <button className="cancel">Anuluj</button>
              </div>
              <p>Firma: A</p>
              <p>Opis: loremipsum</p>
              <p>Wymagania: loremipsum</p>
            </div>

            <div className="offer">
              <div className="offer-header">
                <strong>Oferta 2</strong>
                <button className="cancel">Anuluj</button>
              </div>
              <p>Firma: B</p>
              <p>Opis: loremipsum</p>
              <p>Wymagania: loremipsum</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ObservedOffers;
