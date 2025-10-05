import React from "react";
import "../../styles/candidate/myOpinions.css";
import CandidateSidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function MyOpinions() {
  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        <CandidateSidebar active="opinions" />

        <main className="main-content">
          <section className="opinions-content">
            <h2>Moje Opinie</h2>

            <div className="opinion">
              <div className="opinion-header">
                <p><b>Firma A</b></p>
                <a href="#" className="review-link">Wystaw opinię</a>
              </div>
              <p>Praca jako loremipsum</p>
            </div>

            <div className="opinion">
              <p><b>Firma B</b></p>
              <p>Praca jako loremipsum</p>
              <p><b>Opinia wystawiona:</b></p>
              <ol>
                <li>Opis: loremipsum</li>
                <li>Ogólne przeżycia: 5/5</li>
                <li>Komfort pracy: 4/5</li>
                <li>Bezpieczeństwo pracy: 5/5</li>
                <li>Korzyści z pracy: 3/5</li>
              </ol>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
