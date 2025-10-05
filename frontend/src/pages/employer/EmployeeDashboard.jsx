import React from "react";
import { useNavigate } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/EmployeeDashboard.css";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const jobOffers = [
    { id: 1, title: "Logistyk", location: "Warszawa", status: "Aktywna", applications: 10 },
    { id: 2, title: "Specjalista ds. zakupów", location: "Kraków", status: "Zakończona", applications: 4 },
  ];

  const handleManage = () => {
    navigate(`/edit`);
  };

  const handleAdd = () => {
    navigate("/add");
  };

  return (
    <div className="employee-dashboard-page">
      <EmployeeHeader />

      <div className="employee-dashboard-content">
        <EmployeeSidebar />

        <main className="employee-dashboard-main">
          <section className="content-section">
            <h2>Moje oferty</h2>

            <div className="offers-header">
              <input
                type="text"
                placeholder="Szukaj..."
                className="search-input"
              />
              <button className="add-offer-btn" onClick={handleAdd}>
                ➕ Dodaj ofertę
              </button>
            </div>

            <table className="offers-table">
              <thead>
                <tr>
                  <th>Tytuł</th>
                  <th>Lokalizacja</th>
                  <th>Status</th>
                  <th>Aplikacje</th>
                  <th>Opcje</th>
                </tr>
              </thead>
              <tbody>
                {jobOffers.map((offer) => (
                  <tr key={offer.id}>
                    <td>{offer.title}</td>
                    <td>{offer.location}</td>
                    <td>{offer.status}</td>
                    <td>{offer.applications}</td>
                    <td>
                      <button
                        className="manage-btn"
                        onClick={() => handleManage(offer.id)}
                      >
                        ✏️ Zarządzaj
                      </button>
                      <button className="delete-btn">🗑️ Usuń</button>
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
}
