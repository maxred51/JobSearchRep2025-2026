import React, { useEffect, useState } from "react";
import "../../styles/admin/AdminDashboard.css";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Wszyscy");
  const [sortOption, setSortOption] = useState("Brak");

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Brak tokena – użytkownik niezalogowany.");
          return;
        }

        const [kandydaciRes, pracownicyRes] = await Promise.all([
          axios.get("http://localhost:5000/api/kandydat", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/pracownikHR", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const formatStatus = (stan) => {
          if (!stan) return "Nieznany";

          const s = stan.toLowerCase().trim();

          if (s === "aktywny") return "Aktywny";
          if (s === "zablokowany") return "Zablokowany";

          return "Nieznany";
        };


        const kandydaci = kandydaciRes.data.map((k) => ({
  id: k.id,
  name: `${k.imie} ${k.nazwisko}`,
  role: "Kandydat",
  status: formatStatus(k.stan),
}));

const pracownicy = pracownicyRes.data.map((p) => ({
  id: p.id,
  name: `${p.imie} ${p.nazwisko}`,
  role: "Pracownik HR",
  status: formatStatus(p.stan),
}));



        const allUsers = [...kandydaci, ...pracownicy];
        setUsers(allUsers);
        setFiltered(allUsers);

        console.log("Pobrano użytkowników:", allUsers);
      } catch (error) {
        console.error("Błąd pobierania użytkowników:", error);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    if (filterStatus !== "Wszyscy") {
      result = result.filter((u) => u.status === filterStatus);
    }

    if (search.trim() !== "") {
      result = result.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortOption === "Alfabetycznie") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "Rola") {
      result.sort((a, b) => a.role.localeCompare(b.role));
    }

    setFiltered(result);
  }, [users, search, filterStatus, sortOption]);

  return (
    <div className="admin-dashboard">
      <AdminHeader />

      <div className="dashboard-body">
        <AdminSidebar active="users" />

        <main className="main-content">
          <section className="users-section">
            <h2>Użytkownicy</h2>

            <div className="filters">
              <input
                type="text"
                placeholder="🔍 Szukaj..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>Wszyscy</option>
                <option>Aktywny</option>
                <option>Zablokowany</option>
              </select>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option>Brak</option>
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
                {filtered.length > 0 ? (
                  filtered.map((u) => (
                    <tr key={`${u.role}-${u.id}`}>
                      <td>{u.name}</td>
                      <td>{u.role}</td>
                      <td>{u.status}</td>
                      <td>
                        <Link to={`/admin/uzytkownicy/${u.id}`} className="btn-manage">
                          Zarządzaj
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>
                      Brak użytkowników do wyświetlenia.
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
};

export default AdminDashboard;
