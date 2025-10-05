import React from "react";
import "../../styles/admin/CommunicationView.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";

const CommunicationView = () => {
  return (
    <div className="communication-layout">
      <AdminHeader />

      <div className="communication-body">
        <AdminSidebar active="communication" />

        <main className="communication-main">
          <section className="communication-section">
            <a href="/offermanage" className="back-link">← Powrót</a>
            <h2>Historia komunikacji</h2>

            <div className="conversation">
              <div className="conversation-header">
                <span className="user-icon">👤</span>
                <span className="user-name">Tomasz Lewandowski</span>
              </div>

              <div className="messages">
                <div className="message admin">
                  <span className="icon">🛡️</span>
                  <p>Lorem ipsum</p>
                </div>
                <div className="message worker">
                  <span className="icon">👤</span>
                  <p>Lorem ipsum</p>
                </div>
                <div className="message admin">
                  <span className="icon">🛡️</span>
                  <p>Lorem ipsum</p>
                </div>
                <div className="message worker">
                  <span className="icon">👤</span>
                  <p>Lorem ipsum</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CommunicationView;
