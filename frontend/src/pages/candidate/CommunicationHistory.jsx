import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/candidate/CommunicationHistory.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { socket } from "../../socket";

function CommunicationHistory() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [hrList, setHrList] = useState([]);
  const [viewMode, setViewMode] = useState("chats");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const role = localStorage.getItem("rola") || "kandydat";
    const id = Number(localStorage.getItem("userId")); 

    setUserRole(role);
    setUserId(id);
    loadChats();
    loadHRList();
  }, []);

  const loadChats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/wiadomosc/rozmowcy",
        authHeader
      );
      setChats(res.data || []);
    } catch (err) {
      console.error("Błąd pobierania listy rozmów:", err);
    }
  };

  const loadHRList = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/wiadomosc/pracownicy",
        authHeader
      );
      setHrList(res.data || []);
    } catch (err) {
      console.error("Błąd pobierania listy HR:", err);
    }
  };

  const loadConversation = async (role, id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/wiadomosc/konwersacja/${role}/${id}`,
        authHeader
      );

      const rawMessages = res.data || [];

      const formatted = rawMessages.map((msg) => ({
        ...msg,
        typ: Number(msg.nadawca_id) === Number(userId) ? "wyslana" : "odebrana",
      }));

      setMessages(formatted);
      setSelectedChat({ role, userId: id });
      setViewMode("chat");

      await axios.put(
        `http://localhost:5000/api/wiadomosc/przeczytane/${role}/${id}`,
        {},
        authHeader
      );

      socket.emit("join_room", { role, id });
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

    const role = localStorage.getItem("rola") || "kandydat";

    socket.emit("message:send", {
      odbiorca_id: selectedChat.userId,
      odbiorca_typ: selectedChat.role,
      tresc: newMessage,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random(),
        tresc: newMessage,
        nadawca_id: userId,
        nadawca_typ: role,
        odbiorca_id: selectedChat.userId,
        odbiorca_typ: selectedChat.role,
        typ: "wyslana",
        data: new Date().toISOString(),
      },
    ]);

    setNewMessage("");
  };

  useEffect(() => {
  const handleReceive = (msg) => {
    if (!selectedChat) return;

    const isFromSelected =
      Number(msg.nadawca_id) === Number(selectedChat.userId) ||
      Number(msg.odbiorca_id) === Number(selectedChat.userId);

    if (!isFromSelected) return;

    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        typ: Number(msg.nadawca_id) === Number(userId) ? "wyslana" : "odebrana",
      },
    ]);
  };

  socket.on("message:receive", handleReceive);
  return () => {
    socket.off("message:receive", handleReceive);
  };
}, [selectedChat, userId]);

  return (
    <div className="page">
      <Header />
      <div className="container">
        <Sidebar />
        <main className="mainContent">
          <section className="content">
            <h2>Historia komunikacji</h2>

            <div className="chatLayout">
              <aside className="chatSidebar">
                <div className="chatSidebarHeader">
                  <h3>
                    {viewMode === "newChat" ? "Nowa rozmowa" : "Twoje rozmowy"}
                  </h3>
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "newChat" ? "chats" : "newChat")
                    }
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
                        key={chat.id}
                        className={`chatItem ${
                          selectedChat?.userId === chat.id ? "active" : ""
                        }`}
                        onClick={() => loadConversation(chat.rola, chat.id)}
                      >
                        <strong>
                          {chat.imie} {chat.nazwisko}
                        </strong>
                      </div>
                    ))
                  ))}

                {viewMode === "newChat" &&
                  (hrList.length === 0 ? (
                    <p>Brak dostępnych pracowników HR</p>
                  ) : (
                    hrList.map((hr) => (
                      <div
                        key={hr.id}
                        className="chatItem"
                        onClick={() => loadConversation("pracownikHR", hr.id)}
                      >
                        <strong>
                          {hr.imie} {hr.nazwisko}
                        </strong>
                      </div>
                    ))
                  ))}
              </aside>

              <div className="chatBox">
                {selectedChat ? (
                  <>
                    <header className="chatHeader">
                      Rozmowa z {selectedChat.role} #{selectedChat.userId}
                    </header>

                    <div className="messages">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`message ${
                            msg.typ === "wyslana" ? "sent" : "received"
                          }`}
                        >
                          <p>{msg.tresc}</p>
                        </div>
                      ))}
                    </div>

                    <footer className="chatInput">
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
                      {errorMessage && (
                        <div className="errorMessage">
                          <p>{errorMessage}</p>
                        </div>
                      )}
                    </footer>
                  </>
                ) : (
                  <p className="noChatInfo">
                    Wybierz rozmowę z listy lub rozpocznij nową
                  </p>
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
