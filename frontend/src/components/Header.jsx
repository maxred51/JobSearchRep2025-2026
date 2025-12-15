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
  const [initialized, setInitialized] = useState(false); // fetch tylko raz

  const navigate = useNavigate();
  const kandydatIdRaw = localStorage.getItem("userId");
  const kandydatId = kandydatIdRaw ? Number(kandydatIdRaw) : null;
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const parseNotifDate = (notif) => {
    const possible =
      notif?.data ?? notif?.createdAt ?? notif?.date ?? notif?.czas ?? notif?.timestamp;
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

      const raw = Array.isArray(res.data) ? res.data : [];
      const normalized = raw.map((n) => {
        const date = parseNotifDate(n);
        return {
          id: n.id ?? null,
          OfertaId: n.OfertaId ?? n.Ofertaid ?? n.ofertaId ?? n.offerId ?? null,
          przeczytane: Boolean(n.przeczytane),
          data: date.toISOString(),
          powiadomienie_tresc:
            n.powiadomienie_tresc ??
            n.tresc ??
            n.message ??
            (n.tytul
              ? `Nowa oferta: ${n.tytul} – ${n.nazwa_firmy}`
              : "Nowa oferta z obserwowanej firmy"),
        };
      });

      normalized.sort((a, b) => new Date(b.data) - new Date(a.data));
      setObservedOffers((prev) => {
        // zachowaj lokalne zmiany (przeczytane/usunięte)
        const merged = normalized.map((n) => {
          const local = prev.find((o) => o.id === n.id || o.OfertaId === n.OfertaId);
          return local ? { ...n, przeczytane: local.przeczytane } : n;
        });
        return merged;
      });
    } catch (err) {
      console.error("Błąd pobierania powiadomień:", err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [kandydatId, token]);

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
        : prev.some(
            (p) =>
              p.powiadomienie_tresc === normalized.powiadomienie_tresc &&
              p.data === normalized.data
          );

      if (exists) return prev;
      return [normalized, ...prev].sort((a, b) => new Date(b.data) - new Date(a.data));
    });
  }, []);

  useEffect(() => {
    if (!kandydatId) return;

    if (!initialized) fetchNotifications(); // fetch tylko raz

    const handler = (notif) => {
      const target = notif?.kandydatId ?? notif?.userId ?? notif?.targetId ?? null;
      if (target && Number(target) !== Number(kandydatId)) return;
      prependNotification(notif);
    };

    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [kandydatId, fetchNotifications, prependNotification, initialized]);

  const handleToggleNotifications = () => setNotificationsOpen((prev) => !prev);

  const markAsRead = async (offer) => {
    if (!offer) return;

    if (offer.id) {
      try {
        await axios.put(
          `http://localhost:5000/api/powiadomienie/${offer.id}/przeczytane`,
          {},
          authHeader
        );
      } catch (err) {
        console.error("Błąd oznaczania jako przeczytane:", err);
      }
    }

    setObservedOffers((prev) =>
      prev.map((o) =>
        o.id === offer.id || o.OfertaId === offer.OfertaId ? { ...o, przeczytane: true } : o
      )
    );
  };

  const deleteNotification = async (offer) => {
    if (!offer) return;

    if (offer.id) {
      try {
        await axios.delete(`http://localhost:5000/api/powiadomienie/${offer.id}`, authHeader);
      } catch (err) {
        console.error("Błąd usuwania powiadomienia:", err);
      }
    }

    setObservedOffers((prev) =>
      prev.filter((o) => o.id !== offer.id && o.OfertaId !== offer.OfertaId)
    );
  };

  const handleOfferClick = async (offer) => {
    const offerId = offer?.OfertaId ?? offer?.ofertaId ?? offer?.offerId ?? null;
    if (!offerId) return;

    if (!offer.przeczytane) await markAsRead(offer);
    navigate(`/offerpreview/${offerId}`);
    setNotificationsOpen(false);
    setShowAll(false);
  };

  const toggleShowAll = () => setShowAll((prev) => !prev);
  const notificationsToShow = showAll ? observedOffers : observedOffers.slice(0, 3);

  return (
    <header className="dashboard-header">
      <div className="logo"></div>

      <div className="header-right">
        <button className="font-btn">A+</button>
        <button className="font-btn">A-</button>
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
    </header>
  );
}
