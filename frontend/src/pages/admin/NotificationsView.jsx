import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/NotificationsView.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5000/api/powiadomienie/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📬 Powiadomienia z backendu:", response.data); 
      setNotifications(response.data);
    } catch (err) {
      console.error("Błąd podczas pobierania powiadomień:", err);
      setError("Nie udało się pobrać powiadomień.");
    } finally {
      setLoading(false);
    }
  };

  fetchNotifications();
}, []);


  return (
    <div className="notifications-layout">
      <AdminHeader />

      <div className="notifications-body">
        <AdminSidebar active="notifications" />

        <main className="notifications-main">
          <section className="notifications-section">
            <h2>Powiadomienia</h2>

            {loading ? (
              <p>Ładowanie powiadomień...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : notifications.length === 0 ? (
              <p>Brak powiadomień.</p>
            ) : (
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th>Treść</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n, index) => (
                    <tr key={index}>
                      <td>{n.tresc}</td>
                      <td>
                        {new Date(n.data).toLocaleDateString("pl-PL")}
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

export default NotificationsView;
