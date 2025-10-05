import React from "react";
import "../../styles/admin/JobOffers.css";
import AdminHeader from "../../components/AdminHeader"; 
import AdminSidebar from "../../components/AdminSidebar";
import { Link } from "react-router-dom";

const JobOffers = () => {
  const offers = [
    { title: "Analityk R&D", location: "Wrocław", date: "2025-03-15" },
    { title: "Programista", location: "Lublin", date: "2025-03-20" },
  ];

  return (
    <div className="joboffers-page">
      <AdminHeader />

      <div className="joboffers-layout">
        <AdminSidebar active="jobs" />

        <main className="joboffers-main-content">
          <section className="offers-section">
            <h2>Oferty pracy</h2>

            <div className="offers-toolbar">
              <input
                type="text"
                placeholder="🔍 Szukaj"
                className="search-input"
              />
              <select className="filter-select">
                <option>Filtruj</option>
                <option>Aktywne</option>
                <option>Zakończone</option>
              </select>
            </div>

            <table className="offers-table">
              <thead>
                <tr>
                  <th>Tytuł</th>
                  <th>Lokalizacja</th>
                  <th>Data dodania</th>
                  <th>Opcje</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer, index) => (
                  <tr key={index}>
                    <td>{offer.title}</td>
                    <td>{offer.location}</td>
                    <td>{offer.date}</td>
                    <td>
                      <Link to="/offermanage" className="btn-manage">
                        Zarządzaj
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
};

export default JobOffers;
