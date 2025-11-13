import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/CandidateChat.css";

export default function EmployeeChat() {
  const navigate = useNavigate();
  const { candidateId } = useParams(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCandidate = await axios.get(`http://localhost:5000/api/kandydat/${candidateId}`);
        const resMessages = await axios.get(`http://localhost:5000/api/wiadomosc/konwersacja/kandydat/${candidateId}`);
        setCandidate(resCandidate.data);
        setMessages(resMessages.data);
      } catch (err) {
        console.error("Błąd przy pobieraniu danych czatu:", err);
      }
    };
    fetchData();
  }, [candidateId]);

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      from: "employee",
      to: candidateId,
      content: newMessage,
    };

    try {
      await axios.post("http://localhost:5000/api/wiadomosc/send", messageData);
      setMessages([...messages, { ...messageData, id: Date.now() }]);
      setNewMessage("");
    } catch (err) {
      console.error("Błąd przy wysyłaniu wiadomości:", err);
    }
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
                <div className="chat-user">
                  {candidate ? candidate.name : "Ładowanie..."}
                </div>
                <div className="chat-menu">☰</div>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${
                      msg.from === "employee" ? "from-employee" : "from-candidate"
                    }`}
                  >
                    <div className="chat-bubble">{msg.content || msg.text}</div>
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
