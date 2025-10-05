import React from "react";
import { useNavigate } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/ApplicationsOverview.css";

export default function ApplicationsOverview() {
  const navigate = useNavigate();

  const applications = [
    { id: 1, candidate: "Adam Nowak", position: "Logistyk", status: "Oczekująca", category: "Logistyka" },
    { id: 2, candidate: "Ewa Kowalska", position: "Specjalista ds. zakupów", status: "Zaakceptowana", category: "Zakupy" },
    { id: 3, candidate: "Jan Malinowski", position: "R&D Analyst", status: "Odrzucona", category: "IT" },
  ];

  const handleView = () => {
    navigate(`/applicationdetails`);
  };

  const handleEdit = (id) => {
    navigate(`/employee/edit-application/${id}`);
  };

  return (
    <div className="applications-overview-page">
      <EmployeeHeader />

      <div className="applications-overview-content">
        <EmployeeSidebar />

        <main className="applications-overview-main">
          <section className="content-section">
            <h2>Aplikacje kandydatów</h2>

            <div className="applications-filters">
              <input
                type="text"
                placeholder="Szukaj kandydata..."
                className="search-input"
              />
              <select className="filter-select">
                <option>Status</option>
                <option>Oczekująca</option>
                <option>Zaakceptowana</option>
                <option>Odrzucona</option>
              </select>
              <select className="filter-select">
                <option>Stanowisko</option>
                <option>Logistyk</option>
                <option>Specjalista ds. zakupów</option>
                <option>R&D Analyst</option>
              </select>
              <select className="filter-select">
                <option>Kategoria</option>
                <option>IT</option>
                <option>Logistyka</option>
                <option>Zakupy</option>
              </select>
            </div>

            <table className="applications-table">
              <thead>
                <tr>
                  <th>Kandydat</th>
                  <th>Stanowisko</th>
                  <th>Status</th>
                  <th>Kategoria</th>
                  <th>Opcje</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.candidate}</td>
                    <td>{app.position}</td>
                    <td>{app.status}</td>
                    <td>{app.category}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleView(app.id)}
                      >
                        👁️ Podgląd
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(app.id)}
                      >
                        ✏️ Edytuj
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
