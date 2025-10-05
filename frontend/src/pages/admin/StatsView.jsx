import React from "react";
import "../../styles/admin/StatsView.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";

const StatsView = () => {
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
                <h3>Rejestracje miesięczne</h3>
                <div className="chart">
                  <div style={{ height: "20px" }}></div>
                  <div style={{ height: "40px" }}></div>
                  <div style={{ height: "60px" }}></div>
                  <div style={{ height: "80px" }}></div>
                  <div style={{ height: "100px" }}></div>
                </div>
              </div>

              <div className="stat-card">
                <h3>Oferty pracy tygodniowo</h3>
                <div className="chart">
                  <div style={{ height: "30px" }}></div>
                  <div style={{ height: "50px" }}></div>
                  <div style={{ height: "70px" }}></div>
                  <div style={{ height: "40px" }}></div>
                  <div style={{ height: "90px" }}></div>
                </div>
              </div>

              <div className="stat-card">
                <h3>Liczba użytkowników</h3>
                <p className="stat-value">1052</p>
              </div>

              <div className="stat-card">
                <h3>Zapytania na sekundę</h3>
                <p className="stat-value">107</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StatsView;
