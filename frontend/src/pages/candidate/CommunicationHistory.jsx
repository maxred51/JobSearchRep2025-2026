import React from "react";
import "../../styles/candidate/CommunicationHistory.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

function CommunicationHistory() {
  return (
    <div className="page">
      <Header />

      <div className="container">
        <Sidebar />

        <main className="mainContent">
          <section className="content">
            <h2>Historia komunikacji</h2>

            <div className="chatBox">
              <div className="chatHeader">
                <span className="avatar">👤</span>
                <span className="chatTitle">PracownikHR - Firma A</span>
                <span className="menu">☰</span>
              </div>

              <div className="messages">
                <div className="message received">loremipsum</div>
                <div className="message sent">loremipsum</div>
                <div className="message received">loremipsum</div>
                <div className="message sent">loremipsum</div>
                <div className="message received">loremipsum</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default CommunicationHistory;
