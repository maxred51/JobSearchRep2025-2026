<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/CommunicationView.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";

const CommunicationView = () => {
  const [hrList, setHrList] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [viewMode, setViewMode] = useState("chats");

  const token = localStorage.getItem("token");

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

  const loadConversation = async (hrId) => {
    if (!hrId) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/wiadomosc/konwersacja/pracownikHR/${hrId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formattedMessages = response.data.map((msg) => ({
        ...msg,
        typ: msg.nadawca_typ === "admin" ? "admin" : "worker",
      }));

      setMessages(formattedMessages);
      setSelectedChat(hrId);
      setViewMode("chat");

      await axios.put(
        `http://localhost:5000/api/wiadomosc/mark-read/pracownikHR/${hrId}`,
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
          odbiorca_id: selectedChat,
          odbiorca_typ: "pracownikHR",
          tresc: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        { tresc: newMessage, typ: "admin", data: new Date().toISOString() },
      ]);
      setNewMessage("");
    } catch (err) {
      console.error("Błąd wysyłania wiadomości:", err);
    }
  };

  useEffect(() => {
    loadHRList();
    loadChats();
  }, []);

  return (
    <div className="communication-layout">
      <AdminHeader />

      <div className="communication-body">
        <AdminSidebar active="communication" />

        <main className="communication-main">
          <section className="communication-section">
            <a href="/offermanage" className="back-link">← Powrót</a>
            <h2>Historia komunikacji</h2>

            <div className="chatLayout">
              <aside className="chatList">
                <div className="chatListHeader">
                  <h3>{viewMode === "newChat" ? "Nowa rozmowa" : "Twoje rozmowy"}</h3>
                  <button onClick={() => setViewMode(viewMode === "newChat" ? "chats" : "newChat")}>
                    {viewMode === "newChat" ? "← Wróć" : "+ Nowa rozmowa"}
                  </button>
                </div>

                {viewMode === "chats" &&
                  (chats.length === 0 ? (
                    <p>Brak rozmów</p>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.rozmowca_id} 
                        className={`chatItem ${selectedChat === chat.rozmowca_id ? "active" : ""}`}
                        onClick={() => loadConversation(chat.rozmowca_id)}
                      >
                        <b>{chat.rozmowca_nazwa || `HR ID ${chat.rozmowca_id}`}</b>
                        <p>{chat.tresc}</p>
                        <small>{new Date(chat.data).toLocaleString()}</small>
                      </div>
                    ))
                  ))}

                {viewMode === "newChat" &&
                  (hrList.length === 0 ? (
                    <p>Brak dostępnych pracowników HR</p>
                  ) : (
                    hrList.map((hr) => (
                      <div
                        key={hr.id} // unikalny key
                        className="chatItem"
                        onClick={() => loadConversation(hr.id)}
                      >
                        <b>{hr.imie} {hr.nazwisko}</b>
                        <p>{hr.email}</p>
                      </div>
                    ))
                  ))}
              </aside>

              {/* Okno czatu */}
              <div className="chatBox">
                {selectedChat ? (
                  <>
                    <div className="chatHeader">
                      <span>Rozmowa z HR #{selectedChat}</span>
                    </div>

                    <div className="messages">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`message ${msg.typ === "admin" ? "admin" : "worker"}`}
                        >
                          <p>{msg.tresc}</p>
                          <small>{new Date(msg.data).toLocaleString()}</small>
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
};

export default CommunicationView;
=======
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/CommunicationView.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";

const CommunicationView = () => {
  const [hrList, setHrList] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [viewMode, setViewMode] = useState("chats");

  const token = localStorage.getItem("token");

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

  const loadConversation = async (hrId) => {
    if (!hrId) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/wiadomosc/konwersacja/pracownikHR/${hrId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formattedMessages = response.data.map((msg) => ({
        ...msg,
        typ: msg.nadawca_typ === "admin" ? "admin" : "worker",
      }));

      setMessages(formattedMessages);
      setSelectedChat(hrId);
      setViewMode("chat");

      await axios.put(
        `http://localhost:5000/api/wiadomosc/mark-read/pracownikHR/${hrId}`,
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
          odbiorca_id: selectedChat,
          odbiorca_typ: "pracownikHR",
          tresc: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        { tresc: newMessage, typ: "admin", data: new Date().toISOString() },
      ]);
      setNewMessage("");
    } catch (err) {
      console.error("Błąd wysyłania wiadomości:", err);
    }
  };

  useEffect(() => {
    loadHRList();
    loadChats();
  }, []);

  return (
    <div className="communication-layout">
      <AdminHeader />

      <div className="communication-body">
        <AdminSidebar active="communication" />

        <main className="communication-main">
          <section className="communication-section">
            <a href="/offermanage" className="back-link">← Powrót</a>
            <h2>Historia komunikacji</h2>

            <div className="chatLayout">
              <aside className="chatList">
                <div className="chatListHeader">
                  <h3>{viewMode === "newChat" ? "Nowa rozmowa" : "Twoje rozmowy"}</h3>
                  <button onClick={() => setViewMode(viewMode === "newChat" ? "chats" : "newChat")}>
                    {viewMode === "newChat" ? "← Wróć" : "+ Nowa rozmowa"}
                  </button>
                </div>

                {viewMode === "chats" &&
                  (chats.length === 0 ? (
                    <p>Brak rozmów</p>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.rozmowca_id} 
                        className={`chatItem ${selectedChat === chat.rozmowca_id ? "active" : ""}`}
                        onClick={() => loadConversation(chat.rozmowca_id)}
                      >
                        <b>{chat.rozmowca_nazwa || `HR ID ${chat.rozmowca_id}`}</b>
                        <p>{chat.tresc}</p>
                        <small>{new Date(chat.data).toLocaleString()}</small>
                      </div>
                    ))
                  ))}

                {viewMode === "newChat" &&
                  (hrList.length === 0 ? (
                    <p>Brak dostępnych pracowników HR</p>
                  ) : (
                    hrList.map((hr) => (
                      <div
                        key={hr.id} // unikalny key
                        className="chatItem"
                        onClick={() => loadConversation(hr.id)}
                      >
                        <b>{hr.imie} {hr.nazwisko}</b>
                        <p>{hr.email}</p>
                      </div>
                    ))
                  ))}
              </aside>

              {/* Okno czatu */}
              <div className="chatBox">
                {selectedChat ? (
                  <>
                    <div className="chatHeader">
                      <span>Rozmowa z HR #{selectedChat}</span>
                    </div>

                    <div className="messages">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`message ${msg.typ === "admin" ? "admin" : "worker"}`}
                        >
                          <p>{msg.tresc}</p>
                          <small>{new Date(msg.data).toLocaleString()}</small>
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
};

export default CommunicationView;
>>>>>>> def9ccd (Poprawki)
