import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/admin/UserManagement.css";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

const UserManagement = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/administrator/uzytkownicy/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError(
            "Brak uprawnień — tylko administrator może zobaczyć ten widok."
          );
        } else if (err.response?.status === 404) {
          setError("Użytkownik nie został znaleziony.");
        } else {
          setError("Wystąpił błąd serwera.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleStatusChange = async (nowyStan) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/administrator/uzytkownicy/${id}/status`,
        { stan: nowyStan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser((prev) => ({ ...prev, stan: nowyStan }));
    } catch (err) {
      console.error("Błąd przy zmianie statusu:", err);
      alert(
        err.response?.data?.error ||
          "Nie udało się zmienić statusu użytkownika."
      );
    } finally {
      setUpdating(false);
    }
  };
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordReset = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/administrator/uzytkownicy/${id}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Wysłano kod OTP do użytkownika!");
    } catch (err) {
      console.error("Błąd przy inicjacji resetu hasła:", err);
      alert("Nie udało się wysłać kodu OTP.");
    } finally {
      setUpdating(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/administrator/uzytkownicy/${id}/verify-otp`,
        { otp, noweHaslo: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Hasło zostało zmienione!");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error("Błąd przy weryfikacji OTP:", err);
      alert(err.response?.data?.error || "Nie udało się zmienić hasła.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Ładowanie danych...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return null;

  return (
    <div className="user-management-page">
      <AdminHeader />

      <div className="user-management-layout">
        <AdminSidebar active="users" />

        <main className="user-main-content">
          <section className="user-section">
            <a href="/admin" className="back-link">
              ← Powrót
            </a>

            <div className="user-card">
              <h2>Użytkownik ({user.rola})</h2>

              <div className="user-info-actions">
                <div className="user-info">
                  <h3>Informacje</h3>
                  <p>
                    <strong>Imię:</strong> {user.imie}
                  </p>
                  <p>
                    <strong>Nazwisko:</strong> {user.nazwisko}
                  </p>
                  <p>
                    <strong>E-mail:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Telefon:</strong> {user.telefon}
                  </p>
                  <p>
                    <strong>Status:</strong> {user.stan}
                  </p>
                </div>

                <div className="user-actions">
                  <h3>Akcje</h3>
                  <button
                    className="btn block"
                    onClick={() => handleStatusChange("zablokowany")}
                    disabled={updating || user.stan === "zablokowany"}
                  >
                    Zablokuj
                  </button>

                  <button
                    className="btn unblock"
                    onClick={() => handleStatusChange("aktywny")}
                    disabled={updating || user.stan === "aktywny"}
                  >
                    Odblokuj
                  </button>
                  <button
                    className="btn reset"
                    onClick={handlePasswordReset}
                    disabled={updating}
                  >
                    Wyślij kod OTP
                  </button>

                    <div className="otp-section">
                      <input
                        type="text"
                        placeholder="Wprowadź kod OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="Nowe hasło"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        onClick={handleOtpVerify}
                        className="btn reset"
                        disabled={updating}
                      >
                        Zmień hasło
                      </button>
                    </div>
                </div>
              </div>

              <div className="user-stats">
                <h3>Statystyki użytkownika</h3>
                <div className="stats-grid">
                  <p>
                    <strong>Ilość aplikacji:</strong> {user.ilosc_aplikacji}
                  </p>
                  <p>
                    <strong>Ilość ofert:</strong> {user.ilosc_ofert}
                  </p>
                  <p>
                    <strong>Ilość opinii:</strong> {user.ilosc_opinii}
                  </p>
                  <p>
                    <strong>Czas bycia zalogowanym:</strong> brak danych
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
