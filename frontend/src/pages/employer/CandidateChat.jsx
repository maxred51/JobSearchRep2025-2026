<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/CandidateChat.css";
import { socket } from "../../socket";

export default function EmployeeChat() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [candidate, setCandidate] = useState(null);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const userId = Number(localStorage.getItem("userId"));
  const userRole = "pracownikHR";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCandidate = await axios.get(
          `http://localhost:5000/api/kandydat/${candidateId}`,
          authHeader
        );
        setCandidate(resCandidate.data);

        const resMessages = await axios.get(
          `http://localhost:5000/api/wiadomosc/konwersacja/kandydat/${candidateId}`,
          authHeader
        );

        const formatted = resMessages.data.map((msg) => ({
          ...msg,
          from: msg.nadawca_typ === "pracownikHR" ? "employee" : "candidate",
          content: msg.tresc,
        }));

        setMessages(formatted);

        socket.emit("join_room", { role: "kandydat", id: candidateId });

      } catch (err) {
        console.error("Błąd przy pobieraniu danych czatu:", err);
      }
    };

    fetchData();
  }, [candidateId]);


  useEffect(() => {
    const handler = (msg) => {
      const isRelevant =
        Number(msg.nadawca_id) === Number(candidateId) ||
        Number(msg.odbiorca_id) === Number(candidateId);

      if (!isRelevant) return;

      const isFromCandidate = msg.nadawca_typ === "kandydat";

      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          from: isFromCandidate ? "candidate" : "employee",
          content: msg.tresc,
        },
      ]);
    };

    socket.on("message:receive", handler);

    return () => {
      socket.off("message:receive", handler);
    };
  }, [candidateId]);


  const handleSend = () => {
    if (!newMessage.trim()) return;

    socket.emit("message:send", {
      nadawca_id: userId,
      nadawca_typ: "pracownikHR",
      odbiorca_id: candidateId,
      odbiorca_typ: "kandydat",
      tresc: newMessage,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        nadawca_id: userId,
        nadawca_typ: "pracownikHR",
        odbiorca_id: candidateId,
        odbiorca_typ: "kandydat",
        tresc: newMessage,
        from: "employee",
        content: newMessage,
      },
    ]);

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
                <div className="chat-user">
                  {candidate ? `${candidate.imie} ${candidate.nazwisko}` : "Ładowanie..."}
                </div>
                <div className="chat-menu">☰</div>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${
                      msg.from === "employee"
                        ? "from-employee"
                        : "from-candidate"
                    }`}
                  >
                    <div className="chat-bubble">{msg.content}</div>
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
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
=======
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/CandidateChat.css";
import { socket } from "../../socket";

export default function EmployeeChat() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [candidate, setCandidate] = useState(null);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const userId = Number(localStorage.getItem("userId"));
  const userRole = "pracownikHR";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCandidate = await axios.get(
          `http://localhost:5000/api/kandydat/${candidateId}`,
          authHeader
        );
        setCandidate(resCandidate.data);

        const resMessages = await axios.get(
          `http://localhost:5000/api/wiadomosc/konwersacja/kandydat/${candidateId}`,
          authHeader
        );

        const formatted = resMessages.data.map((msg) => ({
          ...msg,
          from: msg.nadawca_typ === "pracownikHR" ? "employee" : "candidate",
          content: msg.tresc,
        }));

        setMessages(formatted);

        socket.emit("join_room", { role: "kandydat", id: candidateId });

      } catch (err) {
        console.error("Błąd przy pobieraniu danych czatu:", err);
      }
    };

    fetchData();
  }, [candidateId]);


  useEffect(() => {
    const handler = (msg) => {
      const isRelevant =
        Number(msg.nadawca_id) === Number(candidateId) ||
        Number(msg.odbiorca_id) === Number(candidateId);

      if (!isRelevant) return;

      const isFromCandidate = msg.nadawca_typ === "kandydat";

      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          from: isFromCandidate ? "candidate" : "employee",
          content: msg.tresc,
        },
      ]);
    };

    socket.on("message:receive", handler);

    return () => {
      socket.off("message:receive", handler);
    };
  }, [candidateId]);


  const handleSend = () => {
    if (!newMessage.trim()) return;

    socket.emit("message:send", {
      nadawca_id: userId,
      nadawca_typ: "pracownikHR",
      odbiorca_id: candidateId,
      odbiorca_typ: "kandydat",
      tresc: newMessage,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        nadawca_id: userId,
        nadawca_typ: "pracownikHR",
        odbiorca_id: candidateId,
        odbiorca_typ: "kandydat",
        tresc: newMessage,
        from: "employee",
        content: newMessage,
      },
    ]);

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
                <div className="chat-user">
                  {candidate ? `${candidate.imie} ${candidate.nazwisko}` : "Ładowanie..."}
                </div>
                <div className="chat-menu">☰</div>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${
                      msg.from === "employee"
                        ? "from-employee"
                        : "from-candidate"
                    }`}
                  >
                    <div className="chat-bubble">{msg.content}</div>
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
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
>>>>>>> def9ccd (Poprawki)
