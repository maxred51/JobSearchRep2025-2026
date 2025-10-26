import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/EmployeeDashboard.css";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("token");
      const [offersRes, appsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/oferta/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/aplikacja/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const applications = appsRes.data;
      const offersWithCounts = offersRes.data.map((offer) => {
        const count = applications.filter(
          (app) => app.oferta_id === offer.id
        ).length;
        return { ...offer, liczba_aplikacji: count };
      });

      setJobOffers(offersWithCounts);
    } catch (error) {
      console.error("❌ Błąd podczas pobierania danych:", error);
    }
  };

  fetchOffers();
}, []);


  const handleManage = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleAdd = () => {
    navigate("/add");
  };

  const handleDelete = async (ofertaId) => {
  if (!window.confirm("Czy na pewno chcesz usunąć tę ofertę?")) return;

  const token = localStorage.getItem("token");

  try {
    const { data: powiazania } = await axios.get(
      `http://localhost:5000/api/oferta/${ofertaId}/powiazania`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    for (const poziomId of powiazania.poziomy) {
      await axios.delete(
        `http://localhost:5000/api/oferta_poziom/${ofertaId}/${poziomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    for (const trybId of powiazania.tryby) {
      await axios.delete(
        `http://localhost:5000/api/oferta_tryb/${ofertaId}/${trybId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    for (const wymiarId of powiazania.wymiary) {
      await axios.delete(
        `http://localhost:5000/api/oferta_wymiar/${ofertaId}/${wymiarId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    for (const umowaId of powiazania.umowy) {
      await axios.delete(
        `http://localhost:5000/api/oferta_umowa/${ofertaId}/${umowaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    await axios.delete(
      `http://localhost:5000/api/oferta/${ofertaId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setJobOffers(prev => prev.filter(offer => offer.id !== ofertaId));

    alert("Oferta i wszystkie powiązania zostały usunięte.");

  } catch (error) {
    console.error("❌ Błąd podczas usuwania oferty lub powiązań:", error.response?.data || error);
    alert(error.response?.data?.error || "Nie udało się usunąć oferty lub powiązań.");
  }
};

  const filteredOffers = jobOffers.filter((offer) =>
    offer.tytul?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredOffers.length > 0 ? (
                  filteredOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td>{offer.tytul}</td>
                      <td>{offer.lokalizacja}</td>
                      <td>{offer.aktywna}</td>
                      <td>{offer.liczba_aplikacji || 0}</td>
                      <td>
                        <button
                          className="manage-btn"
                          onClick={() => handleManage(offer.id)}
                        >
                          ✏️ Zarządzaj
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(offer.id)}
                        >
                          🗑️ Usuń
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Brak ofert do wyświetlenia
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
