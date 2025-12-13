import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../../styles/admin/CommunicationView.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";
import { socket } from "../../socket"; 

const CommunicationView = () => {
  const [hrList, setHrList] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [viewMode, setViewMode] = useState("chats");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");
  const adminId = Number(localStorage.getItem("userId")); 
  const messagesEndRef = useRef(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHRList = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/wiadomosc/pracownicy", authHeader);
      setHrList(res.data || []);
    } catch (err) {
      console.error("Błąd pobierania listy HR:", err);
    }
  };

  const loadChats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/wiadomosc/lista", authHeader);
      setChats(res.data || []);
    } catch (err) {
      console.error("Błąd pobierania listy rozmów:", err);
    }
  };

  const loadConversation = async (hrId) => {
    if (!hrId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/wiadomosc/konwersacja/pracownikHR/${hrId}`,
        authHeader
      );

      const formatted = (res.data || []).map((msg) => ({
        ...msg,
        typ: msg.nadawca_id === adminId ? "admin" : "worker",
      }));

      setMessages(formatted);
      setSelectedChat(hrId);
      setViewMode("chat");

      await axios.put(
        `http://localhost:5000/api/wiadomosc/mark-read/pracownikHR/${hrId}`,
        {},
        authHeader
      );

      socket.emit("join_room", { role: "pracownikHR", id: hrId });

      scrollToBottom();
    } catch (err) {
      console.error("Błąd pobierania konwersacji:", err);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) {
      setErrorMessage("Nie można wysłać pustej wiadomości!");
      return;
    }

    setErrorMessage("");

    const msgData = {
      odbiorca_id: selectedChat,
      odbiorca_typ: "pracownikHR",
      tresc: newMessage,
      nadawca_id: adminId,
      nadawca_typ: "admin",
    };

    socket.emit("message:send", msgData);

    setMessages((prev) => [
      ...prev,
      { ...msgData, typ: "admin", data: new Date().toISOString() },
    ]);

    setNewMessage("");
    scrollToBottom();
  };

  useEffect(() => {
    const handleReceive = (msg) => {
      if (!selectedChat) return;
      const isFromSelected =
        msg.nadawca_id === selectedChat || msg.odbiorca_id === selectedChat;
      if (!isFromSelected) return;

      setMessages((prev) => [
        ...prev,
        { ...msg, typ: msg.nadawca_id === adminId ? "admin" : "worker" },
      ]);
      scrollToBottom();
    };

    socket.on("message:receive", handleReceive);
    return () => socket.off("message:receive", handleReceive);
  }, [selectedChat, adminId]);

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
                  <button
                    onClick={() => setViewMode(viewMode === "newChat" ? "chats" : "newChat")}
                  >
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
                      <div key={hr.id} className="chatItem" onClick={() => loadConversation(hr.id)}>
                        <b>{hr.imie} {hr.nazwisko}</b>
                        <p>{hr.email}</p>
                      </div>
                    ))
                  ))}
              </aside>

              <div className="chatBox">
                {selectedChat ? (
                  <>
                    <div className="chatHeader">
                      <span>Rozmowa z HR #{selectedChat}</span>
                    </div>

                    <div className="messages">
                      {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.typ}`}>
                          <p>{msg.tresc}</p>
                          <small>{new Date(msg.data).toLocaleString()}</small>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="chatInput">
                      <input
                        type="text"
                        placeholder="Napisz wiadomość..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          if (e.target.value.trim()) setErrorMessage("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <button onClick={sendMessage}>Wyślij</button>
                      {errorMessage && <div className="errorMessage">{errorMessage}</div>}
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
