import React, { useEffect, useState } from "react";
import "../../styles/admin/StatsView.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";
import axios from "axios";

const StatsView = () => {
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [hrCount, setHrCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [offersCount, setOffersCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [
          resCandidates,
          resHr,
          resAdmins,
          resOffers,
          resApplications,
          resCompanies
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/kandydat", { headers }),
          axios.get("http://localhost:5000/api/pracownikHR", { headers }),
          axios.get("http://localhost:5000/api/administrator", { headers }),
          axios.get("http://localhost:5000/api/oferta", { headers }),
          axios.get("http://localhost:5000/api/aplikacja", { headers }),
          axios.get("http://localhost:5000/api/firma", { headers })
        ]);

        setCandidatesCount(resCandidates.data.length);
        setHrCount(resHr.data.length);
        setAdminCount(resAdmins.data.length);
        setOffersCount(resOffers.data.length);
        setApplicationsCount(resApplications.data.length);
        setCompaniesCount(resCompanies.data.length);

      } catch (error) {
        console.error("Błąd przy pobieraniu statystyk:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="stats-layout">
      <AdminHeader />
      <div className="stats-body">
        <AdminSidebar className="stats-sidebar" active="stats" />
        <main className="stats-main">
          <section className="stats-section">
            <h2>Statystyki</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Kandydaci</h3>
                <p className="stat-value">{candidatesCount}</p>
              </div>
              <div className="stat-card">
                <h3>Pracownicy HR</h3>
                <p className="stat-value">{hrCount}</p>
              </div>
              <div className="stat-card">
                <h3>Administratorzy</h3>
                <p className="stat-value">{adminCount}</p>
              </div>
              <div className="stat-card">
                <h3>Oferty pracy</h3>
                <p className="stat-value">{offersCount}</p>
              </div>
              <div className="stat-card">
                <h3>Aplikacje</h3>
                <p className="stat-value">{applicationsCount}</p>
              </div>
              <div className="stat-card">
                <h3>Firmy</h3>
                <p className="stat-value">{companiesCount}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StatsView;
