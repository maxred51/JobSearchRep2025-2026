import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/ApplicationsOverview.css";

export default function ApplicationsOverview() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/aplikacja", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📦 Otrzymane dane surowe:", res.data);

      const normalized = res.data.map((a) => ({
        id: a.id,
        Kandydatid: a.Kandydatid,  
        Ofertaid: a.Ofertaid,      
        status: a.status || "Oczekująca",
        candidate_name:
          a.imie && a.nazwisko ? `${a.imie} ${a.nazwisko}` : "Nieznany kandydat",
        position: a.stanowisko || "Brak stanowiska",
        category: a.kategoria || "Brak kategorii",
      }));

      setApplications(normalized);
    } catch (err) {
      console.error("❌ Błąd podczas pobierania aplikacji:", err);
    }
  };

  fetchApplications();
}, [employeeId]);

  const handleView = (id) => navigate(`/employee/application/${id}`);
  const handleEdit = (id) => navigate(`/employee/edit-application/${id}`);


  const handleDelete = async (Kandydatid, Ofertaid) => {
  const confirmDelete = window.confirm("Czy na pewno chcesz usunąć tę aplikację?");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:5000/api/aplikacja/${Kandydatid}/${Ofertaid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    setApplications((prev) =>
      prev.filter((app) => !(app.Kandydatid === Kandydatid && app.Ofertaid === Ofertaid))
    );

    alert("✅ Aplikacja została usunięta.");
  } catch (err) {
    console.error("❌ Błąd podczas usuwania aplikacji:", err);
    alert("❌ Nie udało się usunąć aplikacji.");
  }
};

  const filteredApps = applications.filter((app) => {
    const matchesSearch = app.candidate_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    const matchesPosition = positionFilter ? app.position === positionFilter : true;
    const matchesCategory = categoryFilter ? app.category === categoryFilter : true;
    return matchesSearch && matchesStatus && matchesPosition && matchesCategory;
  });

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Status</option>
                <option>Oczekująca</option>
                <option>Zaakceptowana</option>
                <option>Odrzucona</option>
              </select>

              <select
                className="filter-select"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <option value="">Stanowisko</option>
                {[...new Set(applications.map((a) => a.position))]
                  .filter(Boolean)
                  .map((pos, index) => (
                    <option key={`${pos}-${index}`} value={pos}>
                      {pos}
                    </option>
                  ))}
              </select>

              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Kategoria</option>
                {[...new Set(applications.map((a) => a.category))]
                  .filter(Boolean)
                  .map((cat, index) => (
                    <option key={`${cat}-${index}`} value={cat}>
                      {cat}
                    </option>
                  ))}
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
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <tr key={app.id}>
                      <td>{app.candidate_name}</td>
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
                          Rozmowa
                        </button>
                        <button
  className="delete-btn"
  onClick={() => handleDelete(app.Kandydatid, app.Ofertaid)}
>
  🗑️ Usuń
</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Brak aplikacji do wyświetlenia
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
