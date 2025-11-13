import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/candidate/CommunicationHistory.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

function CommunicationHistory() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [, setRolaUzytkownika] = useState("");
  const [hrList, setHrList] = useState([]);
  const [viewMode, setViewMode] = useState("chats"); 

  const token = localStorage.getItem("token");

  const loadChats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wiadomosc/lista", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(response.data);
    } catch (err) {
      console.error("Błąd pobierania listy rozmów:", err);
    }
  };

  const loadHRList = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wiadomosc/pracownicy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHrList(response.data);
    } catch (err) {
      console.error("Błąd pobierania listy HR:", err);
    }
  };

  const loadConversation = async (rola, rozmowcaId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/wiadomosc/konwersacja/${rola}/${rozmowcaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
      setSelectedChat({ rola, rozmowcaId });
      setViewMode("chat");

      await axios.put(
        `http://localhost:5000/api/wiadomosc/mark-read/${rola}/${rozmowcaId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Błąd pobierania konwersacji:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      await axios.post(
        "http://localhost:5000/api/wiadomosc/send",
        {
          odbiorca_id: selectedChat.rozmowcaId,
          odbiorca_typ: selectedChat.rola,
          tresc: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [
        ...prev,
        { tresc: newMessage, typ: "wyslana", data: new Date().toISOString() },
      ]);
      setNewMessage("");
    } catch (err) {
      console.error("Błąd wysyłania wiadomości:", err);
    }
  };

  useEffect(() => {
    const rola = localStorage.getItem("rola");
    setRolaUzytkownika(rola || "kandydat");
    loadChats();
    loadHRList();
  }, []);

  return (
    <div className="page">
      <Header />
      <div className="container">
        <Sidebar />
        <main className="mainContent">
          <section className="content">
            <h2>Historia komunikacji</h2>

            <div className="chatLayout">
              <aside className="chatList">
                <div className="chatListHeader">
                  <h3>{viewMode === "newChat" ? "Nowa rozmowa" : "Twoje rozmowy"}</h3>
                  <button onClick={() => setViewMode(viewMode === "newChat" ? "chats" : "newChat")}>
                    {viewMode === "newChat" ? "← Wróć" : "+ Nowa rozmowa"}
                  </button>
                </div>

                {viewMode === "chats" && (
                  <>
                    {chats.length === 0 ? (
                      <p>Brak rozmów</p>
                    ) : (
                      chats.map((chat, i) => (
                        <div
                          key={i}
                          className={`chatItem ${
                            selectedChat &&
                            selectedChat.rozmowcaId === chat.id &&
                            "active"
                          }`}
                          onClick={() => loadConversation(chat.rola || "pracownikHR", chat.id)}
                        >
                          <b>{chat.nazwa_firmy || chat.nazwa || `Rozmowa ID ${chat.id}`}</b>
                          <p>{chat.tresc}</p>
                          <small>{new Date(chat.data).toLocaleString()}</small>
                        </div>
                      ))
                    )}
                  </>
                )}

                {viewMode === "newChat" && (
                  <>
                    {hrList.length === 0 ? (
                      <p>Brak dostępnych pracowników HR</p>
                    ) : (
                      hrList.map((hr) => (
                        <div
                          key={hr.id}
                          className="chatItem"
                          onClick={() => loadConversation("pracownikHR", hr.id)}
                        >
                          <b>{hr.imie} {hr.nazwisko}</b>
                          <p>{hr.email}</p>
                        </div>
                      ))
                    )}
                  </>
                )}
              </aside>

              <div className="chatBox">
                {selectedChat ? (
                  <>
                    <div className="chatHeader">
                      <span>
                        Rozmowa z {selectedChat.rola} #{selectedChat.rozmowcaId}
                      </span>
                    </div>

                    <div className="messages">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`message ${
                            msg.typ === "wyslana" ? "sent" : "received"
                          }`}
                        >
                          {msg.tresc}
                        </div>
                      ))}
                    </div>

                    <div className="chatInput">
                      <input
                        type="text"
                        placeholder="Napisz wiadomość..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <button onClick={sendMessage}>Wyślij</button>
                    </div>
                  </>
                ) : (
                  <p>Wybierz rozmowę z listy lub rozpocznij nową</p>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default CommunicationHistory;
