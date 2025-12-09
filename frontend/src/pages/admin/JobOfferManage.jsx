import React, { useEffect, useState } from "react";
import "../../styles/admin/JobOfferManage.css";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader"; 
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const JobOfferManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/oferta/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOffer(res.data);
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać danych oferty.");
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const handleDelete = async (ofertaId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę ofertę?")) return;

    const token = localStorage.getItem("token");
    setDeleting(true);

    try {
      const { data: powiazania } = await axios.get(
        `http://localhost:5000/api/oferta/${ofertaId}/powiazania`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      for (const poziomId of powiazania.poziomy || []) {
        await axios.delete(
          `http://localhost:5000/api/oferta_poziom/${ofertaId}/${poziomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      for (const trybId of powiazania.tryby || []) {
        await axios.delete(
          `http://localhost:5000/api/oferta_tryb/${ofertaId}/${trybId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      for (const wymiarId of powiazania.wymiary || []) {
        await axios.delete(
          `http://localhost:5000/api/oferta_wymiar/${ofertaId}/${wymiarId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      for (const umowaId of powiazania.umowy || []) {
        await axios.delete(
          `http://localhost:5000/api/oferta_umowa/${ofertaId}/${umowaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await axios.delete(
        `http://localhost:5000/api/oferta/${ofertaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Oferta i wszystkie powiązania zostały pomyślnie usunięte.");
      navigate("/offersadmin"); 

    } catch (error) {
      console.error("Błąd podczas usuwania oferty:", error.response?.data || error);
      alert(error.response?.data?.error || "Nie udało się usunąć oferty lub powiązań.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p>Ładowanie oferty...</p>;
  if (error) return <p>{error}</p>;
  if (!offer) return <p>Nie znaleziono oferty.</p>;

  return (
    <div className="job-offer-manage-page">
      <AdminHeader />

      <div className="job-offer-layout">
        <AdminSidebar active="jobs" />

        <main className="offer-main-content">
          <section className="offer-section">
            <Link to="/offersadmin" className="back-link">← Powrót</Link>

            <h2>{offer.tytul}</h2>

            <div className="offer-card">
              <div className="offer-info">
                <p><strong>Opis:</strong> {offer.opis || "Brak opisu"}</p>
                <p><strong>Wymagania:</strong> {offer.wymagania || "Brak danych"}</p>
                <p><strong>Wynagrodzenie:</strong> {offer.wynagrodzenie || "Nie podano"}</p>
                <p><strong>Lokalizacja:</strong> {offer.lokalizacja}</p>
                <p><strong>Czas pracy:</strong> {offer.czas}</p>
                <p><strong>Kategoria:</strong> {offer.nazwa_kategorii_pracy}</p>
                <p><strong>Pracownik HR:</strong> {offer.hr_imie} {offer.hr_nazwisko}</p>
                <p><strong>Rodzaj umowy:</strong> {offer.umowy || "Brak danych"}</p>
                <p><strong>Tryb pracy:</strong> {offer.tryby || "Brak danych"}</p>
                <p><strong>Wymiar:</strong> {offer.wymiary || "Brak danych"}</p>
                <p><strong>Poziom:</strong> {offer.poziomy || "Brak danych"}</p>
              </div>
            </div>

            <div className="offer-actions">
              <Link to={`/offeredit/${offer.id}`} className="btn-manage">
                Edytuj ofertę
              </Link>
              <Link to={`/communicationview/pracownikHR/${offer.id}`} className="btn-message">
                Wyślij wiadomość
              </Link>
              <button
                className="btn-delete"
                onClick={() => handleDelete(offer.id)}
                disabled={deleting}
              >
                {deleting ? "Usuwanie..." : "Usuń ofertę"}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default JobOfferManage;
