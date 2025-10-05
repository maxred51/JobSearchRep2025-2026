import React from "react";
import "../../styles/admin/UserManagement.css";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

const UserManagement = () => {
  const user = {
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jk@gmail.com",
    phone: "456 999 999",
    applications: 5,
    offers: 2,
    reviews: 8,
    activeTime: "6h",
  };

  return (
    <div className="user-management-page">
      <AdminHeader />

      <div className="user-management-layout">
        <AdminSidebar active="users" />

        <main className="user-main-content">
          <section className="user-section">
            <a href="/admin" className="back-link">← Powrót</a>

            <div className="user-card">
              <h2>Użytkownik</h2>

              <div className="user-info-actions">
                <div className="user-info">
                  <h3>Informacje</h3>
                  <p><strong>Imię:</strong> {user.firstName}</p>
                  <p><strong>Nazwisko:</strong> {user.lastName}</p>
                  <p><strong>E-mail:</strong> {user.email}</p>
                  <p><strong>Telefon:</strong> {user.phone}</p>
                </div>

                <div className="user-actions">
                  <h3>Akcje</h3>
                  <button className="btn block">Zablokuj</button>
                  <button className="btn unblock">Odblokuj</button>
                  <button className="btn reset">Reset hasła</button>
                </div>
              </div>
              <div className="user-stats">
                <h3>Statystyki użytkownika</h3>
                <div className="stats-grid">
                  <p><strong>Ilość aplikacji:</strong> {user.applications}</p>
                  <p><strong>Ilość ofert:</strong> {user.offers}</p>
                  <p><strong>Ilość opinii:</strong> {user.reviews}</p>
                  <p><strong>Czas bycia zalogowanym:</strong> {user.activeTime}</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
