import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";
import "../styles/components/Header.css";
import { FontContext } from "../context/FontContext";

export default function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [observedOffers, setObservedOffers] = useState([]);
  const [toasts, setToasts] = useState([]); // Dla real-time powiadomień na ekranie
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const kandydatIdRaw = localStorage.getItem("userId");
  const kandydatId = kandydatIdRaw ? Number(kandydatIdRaw) : null;
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const { increaseFont, decreaseFont } = useContext(FontContext);

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
      setObservedOffers(normalized);
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

    setObservedOffers((prev) => {
      const exists = prev.some((p) => p.id === normalized.id);
      if (exists) return prev;
      return [normalized, ...prev].sort((a, b) => new Date(b.data) - new Date(a.data));
    });

    // toast dla wyświetlenia na ekranie
    const toastId = Date.now();
    setToasts((prev) => [...prev, { id: toastId, tresc: normalized.tresc }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 5000);
  }, []);

  useEffect(() => {
    if (!kandydatId) return;

    fetchNotifications();

    const handler = (notif) => {
      const target = notif?.Kandydatid ?? notif?.kandydatId ?? null;
      if (target && Number(target) !== Number(kandydatId)) return;
      prependNotification(notif);
    };

    socket.on("notification:receive", handler);
    return () => socket.off("notification:receive", handler);
  }, [kandydatId, fetchNotifications, prependNotification]);

  const handleToggleNotifications = () => setNotificationsOpen((prev) => !prev);

  const markAsRead = async (offer) => {
    if (!offer.id) return;

    try {
      await axios.put(
        `http://localhost:5000/api/powiadomienie/${offer.id}/przeczytane`,
        {},
        authHeader
      );
    } catch (err) {
      console.error("Błąd oznaczania jako przeczytane:", err);
    }

    setObservedOffers((prev) =>
      prev.map((o) =>
        o.id === offer.id ? { ...o, przeczytane: true } : o
      )
    );
  };

  const deleteNotification = async (offer) => {
    if (!offer.id) return;

    try {
      await axios.delete(`http://localhost:5000/api/powiadomienie/${offer.id}`, authHeader);
    } catch (err) {
      console.error("Błąd usuwania powiadomienia:", err);
    }

    setObservedOffers((prev) =>
      prev.filter((o) => o.id !== offer.id)
    );
  };

  const handleOfferClick = async (offer) => {
    const offerId = offer?.Ofertaid ?? null;
    if (!offerId) return;

    if (!offer.przeczytane) await markAsRead(offer);
    navigate(`/offerpreview/${offerId}`);
    setNotificationsOpen(false);
  };

  const notificationsToShow = observedOffers.slice(0, 3);

  return (
    <header className="dashboard-header">
      <div className="logo"></div>

      <div className="header-right">
        <div className="font-controls">
          <button className="font-btn" onClick={increaseFont}>A+</button>
          <button className="font-btn" onClick={decreaseFont}>A-</button>
        </div>
        <span className="welcome">
          Witaj{ kandydatId ? `, kandydacie #${kandydatId}` : "" }
        </span>

        <span
          className="notifications"
          onClick={handleToggleNotifications}
          role="button"
          aria-label="Powiadomienia"
        >
          🔔
          {observedOffers.some((o) => !o.przeczytane) && <span className="notification-dot"></span>}
        </span>

        {notificationsOpen && (
          <div className="notifications-panel" aria-live="polite">
            {loading ? (
              <p>Ładowanie powiadomień...</p>
            ) : observedOffers.length > 0 ? (
              <>
                {notificationsToShow.map((offer, idx) => (
                  <div
                    key={offer.id || idx}
                    className={`notification-item ${offer.przeczytane ? "read" : "unread"}`}
                    onClick={() => handleOfferClick(offer)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleOfferClick(offer)}
                    style={{ fontWeight: offer.przeczytane ? 'normal' : 'bold' }}
                  >
                    <p>{offer.tresc || "Brak treści powiadomienia"}</p>

                    <div className="notification-actions">
                      {!offer.przeczytane && (
                        <button
                          className="mark-read-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(offer);
                          }}
                        >
                          Przeczytane
                        </button>
                      )}

                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(offer);
                        }}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}

                {observedOffers.length > 3 && (
                  <button className="show-all-btn" onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/notifications-candidate');
                  }}>
                    Pokaż wszystkie
                  </button>
                )}
              </>
            ) : (
              <p>Brak powiadomień</p>
            )}
          </div>
        )}

        <Link to="/settings" className="settings-link">
          Ustawienia konta
        </Link>

        <Link
          to="/login"
          className="logout-link"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
            localStorage.removeItem("rola");
          }}
        >
          Wyloguj się
        </Link>
      </div>

      {/* toast dla real-time powiadomień */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.tresc}
          </div>
        ))}
      </div>
    </header>
  );
}