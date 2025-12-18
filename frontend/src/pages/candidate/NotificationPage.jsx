import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { socket } from "../../socket";
import CandidateSidebar from "../../components/Sidebar";
import "../../styles/candidate/NotificationPage.css";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const kandydatIdRaw = localStorage.getItem("userId");
  const kandydatId = kandydatIdRaw ? Number(kandydatIdRaw) : null;
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const parseNotifDate = (notif) => {
    const possible = notif?.data ?? notif?.createdAt ?? notif?.date ?? notif?.czas ?? notif?.timestamp;
    const d = possible ? new Date(possible) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const fetchNotifications = useCallback(async () => {
    if (!kandydatId || !token) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/powiadomienie/kandydat/${kandydatId}`,
        authHeader
      );

      const raw = Array.isArray(res.data) ? res.data : [];
      const normalized = raw.map((n) => ({
        id: n.id,
        Ofertaid: n.Ofertaid,
        przeczytane: Boolean(n.przeczytane),
        data: parseNotifDate(n).toISOString(),
        tresc: n.tresc,
      }));

      normalized.sort((a, b) => new Date(b.data) - new Date(a.data));
      setNotifications(normalized);
    } catch (err) {
      console.error("Błąd pobierania powiadomień:", err);
    } finally {
      setLoading(false);
    }
  }, [kandydatId, token]);

  const prependNotification = useCallback((notif) => {
    if (!notif) return;
    const normalized = {
      id: notif.id,
      Ofertaid: notif.Ofertaid,
      przeczytane: !!notif.przeczytane,
      data: parseNotifDate(notif).toISOString(),
      tresc: notif.tresc,
    };

    setNotifications((prev) => {
      const exists = prev.some((p) => p.id === normalized.id);
      if (exists) return prev;
      return [normalized, ...prev].sort((a, b) => new Date(b.data) - new Date(a.data));
    });
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handler = (notif) => {
      const target = notif?.Kandydatid ?? notif?.kandydatId ?? null;
      if (target && Number(target) !== Number(kandydatId)) return;
      prependNotification(notif);
    };

    socket.on("notification:receive", handler);
    return () => socket.off("notification:receive", handler);
  }, [fetchNotifications, prependNotification, kandydatId]);

  const markAsRead = async (notif) => {
    if (!notif.id) return;
    try {
      await axios.put(
        `http://localhost:5000/api/powiadomienie/${notif.id}/przeczytane`,
        {},
        authHeader
      );
      setNotifications((prev) =>
        prev.map((o) => o.id === notif.id ? { ...o, przeczytane: true } : o)
      );
    } catch (err) {
      console.error("Błąd oznaczania jako przeczytane:", err);
    }
  };

  const deleteNotification = async (notif) => {
    if (!notif.id) return;
    try {
      await axios.delete(`http://localhost:5000/api/powiadomienie/${notif.id}`, authHeader);
      setNotifications((prev) => prev.filter((o) => o.id !== notif.id));
    } catch (err) {
      console.error("Błąd usuwania powiadomienia:", err);
    }
  };

  return (
    <div className="notification-page">
      <CandidateSidebar />
      <div className="content">
        <h1>Moje Powiadomienia</h1>
        {loading ? (
          <p>Ładowanie...</p>
        ) : notifications.length > 0 ? (
          <ul>
            {notifications.map((notif) => (
              <li
                key={notif.id}
                style={{ fontWeight: notif.przeczytane ? 'normal' : 'bold' }}
              >
                <p>{notif.tresc}</p>
                <div>
                  {!notif.przeczytane && (
                    <button onClick={() => markAsRead(notif)}>Przeczytane</button>
                  )}
                  <button onClick={() => deleteNotification(notif)}>Usuń</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak powiadomień</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;