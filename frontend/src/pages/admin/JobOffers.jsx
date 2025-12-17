import React, { useEffect, useState } from "react";
import "../../styles/admin/JobOffers.css";
import AdminHeader from "../../components/AdminHeader"; 
import AdminSidebar from "../../components/AdminSidebar";
import { Link } from "react-router-dom";
import axios from "axios";

const JobOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const res = await axios.get("http://localhost:5000/api/oferta", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOffers(res.data);
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać ofert pracy");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const filteredOffers = offers.filter((offer) =>
    offer.tytul?.toLowerCase().includes(search.toLowerCase())
  );

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
                placeholder="Szukaj"
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <p>Ładowanie ofert...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : filteredOffers.length === 0 ? (
              <p>Brak ofert do wyświetlenia</p>
            ) : (
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
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td>{offer.tytul}</td>
                      <td>{offer.lokalizacja || "Brak danych"}</td>
                      <td>{offer.data.slice(0, 10)}</td>
                      <td>
                        <Link to={`/offermanage/${offer.id}`} className="btn-manage">
                          Zarządzaj
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default JobOffers;
