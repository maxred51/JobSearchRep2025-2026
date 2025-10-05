import React from "react";
import "../../styles/admin/AdminDashboard.css";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const users = [
    { id: 1, name: "Jan Kowalski", role: "Kandydat", status: "Aktywny" },
    { id: 2, name: "Anna Nowak", role: "HR", status: "Zablokowany" },
  ];

  return (
    <div className="admin-dashboard">
      <AdminHeader />

      <div className="dashboard-body">
        <AdminSidebar active="users" />

        <main className="main-content">
          <section className="users-section">
            <h2>Użytkownicy</h2>

            <div className="filters">
              <input type="text" placeholder="🔍 Szukaj" />
              <select>
                <option>Filtruj</option>
                <option>Wszyscy</option>
                <option>Aktywni</option>
                <option>Zablokowani</option>
              </select>
              <select>
                <option>Sortuj</option>
                <option>Alfabetycznie</option>
                <option>Rola</option>
              </select>
            </div>

            <table className="users-table">
              <thead>
                <tr>
                  <th>Nazwa użytkownika</th>
                  <th>Rola</th>
                  <th>Status</th>
                  <th>Uprawnienia</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.role}</td>
                    <td>{u.status}</td>
                    <td>
                      <Link to="/management" className="btn-manage">
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

export default AdminDashboard;
