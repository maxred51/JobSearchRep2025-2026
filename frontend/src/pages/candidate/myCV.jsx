import React from "react";
import "../../styles/candidate/myCV.css";
import CandidateSidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function MyCV() {
  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        <CandidateSidebar active="cv" />

        <main className="main-content">
          <section className="cv-content">
            <div className="cv-header">
              <div className="cv-photo"></div>
              <div className="cv-info">
                <h2>-CV-</h2>
                <h3>Adam Nowak</h3>
                <p><b>E-mail:</b> an@gmail.com</p>
                <p><b>Telefon:</b> +48 555 555 555</p>
                <p><b>Data urodzenia:</b> 23.01.1990</p>
                <p><b>Miasto:</b> Warszawa</p>
              </div>
            </div>

            <div className="cv-section">DOŚWIADCZENIE ZAWODOWE</div>
            <div className="cv-section">WYKSZTAŁCENIE</div>
            <div className="cv-section">ZNAJOMOŚĆ JĘZYKÓW</div>
            <div className="cv-section">UMIEJĘTNOŚCI</div>
            <div className="cv-section">ZAINTERESOWANIA</div>
          </section>
        </main>
      </div>
    </div>
  );
}
