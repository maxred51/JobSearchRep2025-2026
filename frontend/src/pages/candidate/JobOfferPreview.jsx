<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/candidate/JobOfferPreview.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

function JobOfferPreview() {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/oferta/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const offerData = response.data;

        setOffer({
          ...offerData,
          firma: offerData.nazwa_firmy || "Nie podano",
        });
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać danych oferty.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  if (loading) return <p>Ładowanie oferty...</p>;
  if (error) return <p>{error}</p>;
  if (!offer) return <p>Nie znaleziono oferty.</p>;

  const { tytul, opis, firma, wymagania, lokalizacja, czas, wynagrodzenie } =
    offer;

  return (
    <div className="dashboard-wrapper">
      <Header />

      <div className="dashboard-content">
        <Sidebar role="candidate" active="overview" />

        <main className="offer-section">
          <a href="/" className="back-link">
            ← Powrót
          </a>
          <h2 className="offer-title">{tytul || "Brak tytułu"}</h2>

          <p>
            <b>Nazwa firmy:</b> {firma || "Nie podano"}
          </p>
          <p>
            <b>Lokalizacja:</b> {lokalizacja || "Brak informacji"}
          </p>
          <p>
            <b>Wynagrodzenie:</b>{" "}
            {wynagrodzenie ? `${wynagrodzenie} zł` : "Nie podano"}
          </p>
          <p>
            <b>Opis stanowiska:</b> {opis || "Brak opisu"}
          </p>

          <div className="offer-block">
            <b>Wymagania:</b>
            <p>{wymagania || "Brak wymagań"}</p>
          </div>
          <div className="offer-block">
            <b>Czas pracy:</b>
            <p>{czas ? `${czas} godzin tygodniowo` : "Nie określono"}</p>
          </div>

          <div className="offer-footer">
            <div className="offer-links">
              <Link to={`/apply/${id}`} className="apply-link">
                Aplikuj na ofertę
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default JobOfferPreview;
=======
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/candidate/JobOfferPreview.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

function JobOfferPreview() {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/oferta/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const offerData = response.data;

        setOffer({
          ...offerData,
          firma: offerData.nazwa_firmy || "Nie podano",
        });
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać danych oferty.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  if (loading) return <p>Ładowanie oferty...</p>;
  if (error) return <p>{error}</p>;
  if (!offer) return <p>Nie znaleziono oferty.</p>;

  const { tytul, opis, firma, wymagania, lokalizacja, czas, wynagrodzenie } =
    offer;

  return (
    <div className="dashboard-wrapper">
      <Header />

      <div className="dashboard-content">
        <Sidebar role="candidate" active="overview" />

        <main className="offer-section">
          <a href="/" className="back-link">
            ← Powrót
          </a>
          <h2 className="offer-title">{tytul || "Brak tytułu"}</h2>

          <p>
            <b>Nazwa firmy:</b> {firma || "Nie podano"}
          </p>
          <p>
            <b>Lokalizacja:</b> {lokalizacja || "Brak informacji"}
          </p>
          <p>
            <b>Wynagrodzenie:</b>{" "}
            {wynagrodzenie ? `${wynagrodzenie} zł` : "Nie podano"}
          </p>
          <p>
            <b>Opis stanowiska:</b> {opis || "Brak opisu"}
          </p>

          <div className="offer-block">
            <b>Wymagania:</b>
            <p>{wymagania || "Brak wymagań"}</p>
          </div>
          <div className="offer-block">
            <b>Czas pracy:</b>
            <p>{czas ? `${czas} godzin tygodniowo` : "Nie określono"}</p>
          </div>

          <div className="offer-footer">
            <div className="offer-links">
              <Link to={`/apply/${id}`} className="apply-link">
                Aplikuj na ofertę
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default JobOfferPreview;
>>>>>>> def9ccd (Poprawki)
