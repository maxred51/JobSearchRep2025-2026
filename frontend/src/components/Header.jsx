import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";
import "../styles/components/Header.css";

export default function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [observedOffers, setObservedOffers] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
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
        `http://localhost:5000/api/powiadomienie/kandydat/${kandydatId}/observed-offers`,
        authHeader
      );

      const data = Array.isArray(res.data) ? res.data : [];

      const normalized = data.map((n) => ({
        ...n,
        id: n.id ?? n._id ?? null,
        OfertaId: n.OfertaId ?? n.ofertaId ?? n.offerId ?? null,
        przeczytane: !!n.przeczytane,
      }));

      normalized.sort((a, b) => new Date(b.data) - new Date(a.data));
      setObservedOffers(normalized);
    } catch (err) {
      console.error("Błąd pobierania powiadomień:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [kandydatId, token, navigate]);

  const prependNotification = useCallback((notif) => {
    if (!notif) return;

    const normalized = {
      ...notif,
      id: notif.id ?? notif._id ?? null,
      OfertaId: notif.OfertaId ?? notif.ofertaId ?? notif.offerId ?? null,
      przeczytane: !!notif.przeczytane,
      data: parseNotifDate(notif).toISOString(),
      powiadomienie_tresc: notif.powiadomienie_tresc ?? notif.tresc ?? notif.message ?? "",
    };

    setObservedOffers((prev) => {
      const exists = normalized.id
        ? prev.some((p) => p.id === normalized.id)
        : prev.some((p) => p.powiadomienie_tresc === normalized.powiadomienie_tresc && p.data === normalized.data);

      if (exists) return prev;

      const next = [normalized, ...prev];
      next.sort((a, b) => new Date(b.data) - new Date(a.data));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!kandydatId) return;

    const handler = (notif) => {
      try {
        const target = notif?.kandydatId ?? notif?.userId ?? notif?.targetId ?? null;

        if (target && Number(target) !== Number(kandydatId)) {
          return; 
        }

        if (!notif?.id && (!notif?.powiadomienie_tresc || !notif?.data)) {
          fetchNotifications();
          return;
        }

        prependNotification(notif);
      } catch (e) {
        console.error("Błąd obsługi notyfikacji z socket:", e);
      }
    };

    socket.on("notification:new", handler);

    return () => {
      socket.off("notification:new", handler);
    };
  }, [kandydatId, fetchNotifications, prependNotification]);

  const handleToggleNotifications = () => {
    const open = !notificationsOpen;
    setNotificationsOpen(open);

    if (open) {
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    if (!id) return;

    try {
      await axios.put(
        `http://localhost:5000/api/powiadomienie/${id}/przeczytane`,
        {},
        authHeader
      );

      setObservedOffers((prev) => prev.map((o) => (o.id === id ? { ...o, przeczytane: true } : o)));
    } catch (err) {
      console.error("Błąd oznaczania jako przeczytane:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const deleteNotification = async (id) => {
    if (!id) return;

    try {
      await axios.delete(`http://localhost:5000/api/powiadomienie/${id}`, authHeader);
      setObservedOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Błąd usuwania powiadomienia:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleOfferClick = async (offer) => {
    try {
      const offerId = offer?.OfertaId ?? offer?.ofertaId ?? offer?.offerId ?? null;

      if (!offerId) {
        console.warn("Powiadomienie nie ma powiązanej oferty (OfertaId).");
        return;
      }

      if (!offer.przeczytane && offer.id) {
        await markAsRead(offer.id);
      }

      navigate(`/offerpreview/${offerId}`);
      setNotificationsOpen(false);
      setShowAll(false);
    } catch (err) {
      console.error("Błąd kliknięcia powiadomienia:", err);
      const offerIdFallback = offer?.OfertaId ?? offer?.ofertaId ?? offer?.offerId ?? null;
      if (offerIdFallback) navigate(`/offerpreview/${offerIdFallback}`);
    }
  };

  const toggleShowAll = () => setShowAll((prev) => !prev);

  const notificationsToShow = showAll ? observedOffers : observedOffers.slice(0, 3);

  useEffect(() => {
  }, [fetchNotifications]);

  return (
    <header className="dashboard-header">
      <div className="logo"></div>

      <div className="header-right">
        <button className="font-btn">A+</button>
        <button className="font-btn">A-</button>
        <span className="welcome">Witaj{ kandydatId ? `, kandydacie #${kandydatId}` : "" }</span>

        <span className="notifications" onClick={handleToggleNotifications} role="button" aria-label="Powiadomienia">
          🔔
          {observedOffers.some((o) => !o.przeczytane) && <span className="notification-dot"></span>}
        </span>

        {notificationsOpen && (
          <div className="notifications-panel" aria-live="polite">
            {loading ? (
              <p>Ładowanie powiadomień...</p>
            ) : observedOffers.length > 0 ? (
              <>
                {notificationsToShow.map((offer, idx) => {
                  const key = offer.id ?? `${offer.powiadomienie_tresc ?? "no-text"}-${idx}`;

                  return (
                    <div
                      key={key}
                      className={`notification-item ${offer.przeczytane ? "read" : "unread"}`}
                      onClick={() => handleOfferClick(offer)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleOfferClick(offer)}
                    >
                      <p>{offer.powiadomienie_tresc ?? "Brak treści powiadomienia"}</p>

                      <div className="notification-actions">
                        {!offer.przeczytane && offer.id && (
                          <button
                            className="mark-read-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(offer.id);
                            }}
                          >
                            Przeczytane
                          </button>
                        )}

                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(offer.id);
                          }}
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  );
                })}

                {observedOffers.length > 3 && (
                  <button className="show-all-btn" onClick={toggleShowAll}>
                    {showAll ? "Pokaż mniej" : "Pokaż wszystkie"}
                  </button>
                )}
              </>
            ) : (
              <p>Brak ofert z obserwowanych firm lub brak powiadomień</p>
            )}
          </div>
        )}

        <Link to="/settings" className="settings-link">
          Ustawienia konta
        </Link>

        <Link to="/login" className="logout-link" onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
          localStorage.removeItem("rola");
        }}>
          Wyloguj się
        </Link>
      </div>
    </header>
  );
}
