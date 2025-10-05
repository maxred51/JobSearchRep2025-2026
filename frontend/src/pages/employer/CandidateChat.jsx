import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/CandidateChat.css";

export default function CandidateChat() {
  const navigate = useNavigate();

  const candidate = {
    name: "Adam Nowak",
  };

  const [messages, setMessages] = useState([
    { id: 1, text: "Dzień dobry, przesyłam swoje CV.", from: "candidate" },
    { id: 2, text: "Dziękujemy, odezwiemy się wkrótce.", from: "employee" },
    { id: 3, text: "Czy są już jakieś informacje o rekrutacji?", from: "candidate" },
    { id: 4, text: "Jeszcze analizujemy aplikacje, proszę o cierpliwość.", from: "employee" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    setMessages([...messages, { id: messages.length + 1, text: newMessage, from: "employee" }]);
    setNewMessage("");
  };

  const handleBack = () => {
    navigate("/candidates");
  };

  return (
    <div className="candidate-chat-page">
      <EmployeeHeader />

      <div className="candidate-chat-content">
        <EmployeeSidebar />

        <main className="candidate-chat-main">
          <section className="chat-section">
            <button className="back-btn" onClick={handleBack}>
              ← Powrót
            </button>

            <div className="chat-box">
              <div className="chat-header">
                <div className="chat-user">💬 {candidate.name}</div>
                <div className="chat-menu">☰</div>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.from === "employee" ? "from-employee" : "from-candidate"}`}
                  >
                    <div className="chat-bubble">{msg.text}</div>
                  </div>
                ))}
              </div>

              <div className="chat-input-container">
                <input
                  type="text"
                  placeholder="Napisz wiadomość..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="chat-input"
                />
                <button onClick={handleSend} className="chat-send-btn">
                  ➤
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
