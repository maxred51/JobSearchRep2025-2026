import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/candidate/candidateApplications.css";
import Header from "../../components/Header";
import CandidateSidebar from "../../components/Sidebar";

export default function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Musisz być zalogowany, aby zobaczyć aplikacje.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/aplikacja/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Dane aplikacji:", response.data);
        setApplications(response.data);
      } catch (err) {
        console.error("Błąd przy pobieraniu aplikacji:", err);
        setError("Nie udało się pobrać aplikacji.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <p>Ładowanie aplikacji...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard">
      <Header active="overview"/>

      <main className="main">
        <CandidateSidebar active="applications"/>

        <section className="applications-content">
          <h2>Zaaplikowane oferty</h2>

          {applications.length === 0 ? (
            <p>Nie zaaplikowałeś jeszcze na żadną ofertę.</p>
          ) : (
            applications.map((app, index) => (
              <div className="application-card" key={app.id || index}>
                <h3>{app.tytul || "Brak tytułu"}</h3>
                <p><b>Firma:</b> {app.nazwa_firmy || "Nieznana"}</p>
                <p><b>Opis:</b> {app.opis || "Brak opisu"}</p>
                <p><b>Wymagania:</b> {app.wymagania || "Brak informacji"}</p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
