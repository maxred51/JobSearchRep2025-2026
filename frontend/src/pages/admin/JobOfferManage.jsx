import React from "react";
import "../../styles/admin/JobOfferManage.css";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader"; 
import { Link } from "react-router-dom";

const JobOfferManage = () => {
  const offer = {
    title: "Specjalista ds. administracji",
    description: "Zarządzanie dokumentacją i wsparcie administracyjne",
    requirements: "Doświadczenie w administracji biurowej",
    salary: "6000 PLN",
    location: "Warszawa",
    time: "8 godzin",
    category: "Administracja",
    position: "Specjalista ds. administracji",
    hr: "Tomasz Lewandowski",
    contract: "Umowa o pracę",
  };

  return (
    <div className="job-offer-manage-page">
      <AdminHeader />

      <div className="job-offer-layout">
        <AdminSidebar active="jobs" />

        <main className="offer-main-content">
          <section className="offer-section">
            <a href="/offersadmin" className="back-link">← Powrót</a>

            <h2>{offer.title}</h2>

            <div className="offer-card">
              <div className="offer-info">
                <p><strong>Opis:</strong> {offer.description}</p>
                <p><strong>Wymagania:</strong> {offer.requirements}</p>
                <p><strong>Wynagrodzenie:</strong> {offer.salary}</p>
                <p><strong>Lokalizacja:</strong> {offer.location}</p>
                <p><strong>Czas pracy:</strong> {offer.time}</p>
                <p><strong>Kategoria:</strong> {offer.category}</p>
                <p><strong>Stanowisko:</strong> {offer.position}</p>
                <p><strong>Pracownik HR:</strong> {offer.hr}</p>
                <p><strong>Rodzaj umowy:</strong> {offer.contract}</p>
              </div>
            </div>

            <div className="offer-actions">
              <Link to="/offeredit" className="btn-manage">
                Edytuj ofertę
              </Link>
              <Link to="/communicationview" className="btn-message">
                Wyślij wiadomość
              </Link>
              <button className="btn-delete">Usuń ofertę</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default JobOfferManage;
