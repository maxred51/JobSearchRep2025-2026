import React, { useEffect, useState } from "react";
import "../../styles/candidate/ObservedOffers.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ObservedOffers() {
  const [observedCompanies, setObservedCompanies] = useState([]);
  const [savedOffers, setSavedOffers] = useState([]);
  const navigate = useNavigate();
  const candidateId = localStorage.getItem("candidateId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const resCompanies = await axios.get(
          `http://localhost:5000/api/obserwowana_firma`,
          { headers }
        );

        const resOffers = await axios.get(
          `http://localhost:5000/api/zapisana_oferta`,
          { headers }
        );

        setObservedCompanies(resCompanies.data);
        setSavedOffers(resOffers.data);
      } catch (err) {
        console.error(" Błąd przy pobieraniu danych:", err);
      }
    };

    fetchData();
  }, []);

  const handleUnfollow = async (Firmaid) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/obserwowana_firma/${Firmaid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setObservedCompanies((prev) =>
        prev.filter((c) => c.id !== Firmaid)
      );
    } catch (err) {
      console.error("Błąd przy usuwaniu obserwowanej firmy:", err);
    }
  };

  const handleCancelOffer = async (Ofertaid) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/zapisana_oferta/${Ofertaid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedOffers((prev) => prev.filter((o) => o.id !== Ofertaid));
    } catch (err) {
      console.error("Błąd przy anulowaniu zapisanej oferty:", err);
    }
  };

  const handleOfferClick = (Ofertaid) => {
    navigate(`/applicationdetails/${candidateId}/${Ofertaid}`);
  };

  return (
    <div className="dashboard-wrapper">
      <Header />
      <div className="dashboard-content">
        <Sidebar />

        <main className="offers-section">
          <section className="observed-companies">
            <h3>Obserwowane firmy</h3>
            {observedCompanies.length > 0 ? (
              observedCompanies.map((company) => (
                <div key={company.id} className="company">
                  <div className="company-header">
                    <strong>{company.nazwa_firmy}</strong>
                    <button
                      className="btn-unfollow"
                      onClick={() => handleUnfollow(company.id)}
                    >
                      Nie obserwuj
                    </button>
                  </div>
                  {company.oferty?.map((offer) => (
                    <p
                      key={offer.id}
                      className="offer-link"
                      onClick={() => handleOfferClick(offer.id)}
                    >
                      {offer.tytul}
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <p>Brak obserwowanych firm</p>
            )}
          </section>

          <section className="saved-offers">
            <h3>Zapisane oferty</h3>
            {savedOffers.length > 0 ? (
              savedOffers.map((offer) => (
                <div key={offer.id} className="offer">
                  <div className="offer-header">
                    <strong
                      className="offer-link"
                      onClick={() => handleOfferClick(offer.id)}
                    >
                      {offer.tytul}
                    </strong>
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelOffer(offer.id)}
                    >
                      Anuluj
                    </button>
                  </div>
                  <p>Firma: {offer.nazwa_firmy}</p>
                  <p>Opis: {offer.opis}</p>
                  <p>Wymagania: {offer.wymagania}</p>
                </div>
              ))
            ) : (
              <p>Brak zapisanych ofert</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default ObservedOffers;
