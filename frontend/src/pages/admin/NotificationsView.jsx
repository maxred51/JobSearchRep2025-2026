import React from "react";
import "../../styles/admin/NotificationsView.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";

const NotificationsView = () => {
  const notifications = [
    { text: "Prośba o zresetowanie hasła", date: "Dzisiaj" },
    { text: "Nowa aplikacja na ofertę: Kierowcę ciężarówki", date: "Wczoraj" },
    { text: "Loremipsumloremipsum", date: "2025-04-05" },
    { text: "Loremipsumloremipsum", date: "2025-04-05" },
    { text: "Loremipsumloremipsum", date: "2025-03-19" },
    { text: "Loremipsumloremipsum", date: "2025-03-18" },
  ];

  return (
    <div className="notifications-layout">
      <AdminHeader />

      <div className="notifications-body">
        <AdminSidebar active="notifications" />

        <main className="notifications-main">
          <section className="notifications-section">
            <h2>Powiadomienia</h2>
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
                    <td>{n.text}</td>
                    <td>{n.date}</td>
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

export default NotificationsView;
