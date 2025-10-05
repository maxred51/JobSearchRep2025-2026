import React from "react";
import "../../styles/candidate/candidateApplications.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function CandidateApplications() {
  return (
    <div className="dashboard">
      <Header />

      <main className="main">
        <Sidebar />

        <section className="applications-content">
          <h2>Zaaplikowane oferty</h2>

          <div className="application-card">
            <h3>Oferta 1</h3>
            <p><b>Firma:</b> A</p>
            <p><b>Opis:</b> lorem ipsum</p>
            <p><b>Wymagania:</b> lorem ipsum</p>
          </div>

          <div className="application-card">
            <h3>Oferta 2</h3>
            <p><b>Firma:</b> B</p>
            <p><b>Opis:</b> lorem ipsum</p>
            <p><b>Wymagania:</b> lorem ipsum</p>
          </div>

          <div className="application-card">
            <h3>Oferta 3</h3>
            <p><b>Firma:</b> C</p>
            <p><b>Opis:</b> lorem ipsum</p>
            <p><b>Wymagania:</b> lorem ipsum</p>
          </div>

          <div className="application-card">
            <h3>Oferta 4</h3>
            <p><b>Firma:</b> D</p>
            <p><b>Opis:</b> lorem ipsum</p>
            <p><b>Wymagania:</b> lorem ipsum</p>
          </div>
        </section>
      </main>
    </div>
  );
}
