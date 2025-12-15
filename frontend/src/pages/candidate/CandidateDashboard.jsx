import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../styles/candidate/CandidateDashboard.css";
import CandidateSidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function CandidateDashboard() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [savedOffersIds, setSavedOffersIds] = useState([]);
  const [observedCompaniesIds, setObservedCompaniesIds] = useState([]);
  const [clickedOffersIds, setClickedOffersIds] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const [availableModes, setAvailableModes] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [availableDimensions, setAvailableDimensions] = useState([]);
  const [availableContracts, setAvailableContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [offersRes, savedRes, observedRes] = await Promise.all([
          axios.get("http://localhost:5000/api/oferta", { headers }),
          axios.get("http://localhost:5000/api/zapisana_oferta", { headers }),
          axios.get("http://localhost:5000/api/obserwowana_firma", { headers }),
        ]);

        setOffers(offersRes.data || []);
        setFilteredOffers(offersRes.data || []);
        setSavedOffersIds(savedRes.data.map((o) => o.id));
        setObservedCompaniesIds(observedRes.data.map((c) => c.id));
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}`,"Accept": "application/json; charset=utf-8",   "Content-Type": "application/json; charset=utf-8", };

        const [modesRes, levelsRes, dimensionsRes, contractsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/tryb", { headers }),
          axios.get("http://localhost:5000/api/poziom", { headers }),
          axios.get("http://localhost:5000/api/wymiar", { headers }),
          axios.get("http://localhost:5000/api/umowa", { headers }),
        ]);

        setAvailableModes(modesRes.data);
        setAvailableLevels(levelsRes.data);
        setAvailableDimensions(dimensionsRes.data);
        setAvailableContracts(contractsRes.data);
      } catch (error) {
        console.error("Błąd pobierania danych słownikowych:", error);
        alert("Nie udało się pobrać danych słownikowych z serwera.");
      }
    };
    fetchDictionaries();
  }, []);

  const handleSaveOffer = async (offerId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (savedOffersIds.includes(offerId)) {
        await axios.delete(`http://localhost:5000/api/zapisana_oferta/${offerId}`, { headers });
        setSavedOffersIds((prev) => prev.filter((id) => id !== offerId));
      } else {
        await axios.post("http://localhost:5000/api/zapisana_oferta", { Ofertaid: offerId }, { headers });
        setSavedOffersIds((prev) => [...prev, offerId]);
      }
    } catch (error) {
      console.error("Błąd przy zapisywaniu oferty:", error);
    }
  };

  const handleObserveCompany = async (companyId) => {
    if (!companyId) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (observedCompaniesIds.includes(companyId)) {
        await axios.delete(`http://localhost:5000/api/obserwowana_firma/${companyId}`, { headers });
        setObservedCompaniesIds((prev) => prev.filter((id) => id !== companyId));
      } else {
        await axios.post("http://localhost:5000/api/obserwowana_firma", { Firmaid: companyId }, { headers });
        setObservedCompaniesIds((prev) => [...prev, companyId]);
      }
    } catch (error) {
      console.error("Błąd przy obserwowaniu firmy:", error);
      alert("Nie udało się dodać firmy do obserwowanych.");
    }
  };

  const handleSearch = () => {
    const filtered = offers.filter((offer) => {
      const title = (offer.tytul ?? offer.title ?? offer.nazwa ?? "").toLowerCase();
      const offerCategory = (offer.kategoria ?? offer.category ?? "").toLowerCase();
      const offerLocation = (offer.lokalizacja ?? offer.location ?? "").toLowerCase();

      const matchesSearch = title.includes(searchTerm.toLowerCase());
      const matchesCategory = category ? offerCategory === category.toLowerCase() : true;
      const matchesLocation = location ? offerLocation.includes(location.toLowerCase()) : true;

      return matchesSearch && matchesCategory && matchesLocation;
    });
    setFilteredOffers(filtered);
  };

  const getOfferKey = (offer, index) => offer.id ?? offer.ID ?? offer._id ?? `${(offer.tytul ?? offer.title ?? "offer")}-${index}`;
  const getOfferTitle = (offer) => offer.tytul ?? offer.title ?? offer.nazwa ?? offer.name ?? "Brak tytułu";
  const getOfferLocation = (offer) => offer.lokalizacja ?? offer.location ?? "";
  const getCompanyId = (offer) => offer.Firmaid ?? offer.firmaid ?? offer.companyId ?? offer.company?.id ?? offer.firma?.id ?? null;
  const getCompanyName = (offer) => offer.nazwa_firmy ?? offer.firma ?? offer.company ?? offer.companyName ?? offer.company?.nazwa_firmy ?? "Nieznana firma";

  if (loading) return <p>Ładowanie danych...</p>;

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        <CandidateSidebar active="overview" />

        <main className="main-content">
          <section className="offers-section">
            <div className="search-bar">
              <input type="text" placeholder="Szukaj ofert..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Kategoria</option>
                <option value="IT">IT</option>
                <option value="Sprzedaż">Sprzedaż</option>
                <option value="Produkcja">Produkcja</option>
              </select>
              <input type="text" placeholder="Lokalizacja" value={location} onChange={(e) => setLocation(e.target.value)} />
              <button className="search-btn" onClick={handleSearch}>🔍</button>
            </div>

            <div className="offers-list">
              {filteredOffers.length > 0 ? filteredOffers.map((offer, idx) => {
                const key = getOfferKey(offer, idx);
                const title = getOfferTitle(offer);
                const loc = getOfferLocation(offer);
                const companyName = getCompanyName(offer);
                const companyId = getCompanyId(offer);

                return (
                  <div className="offer" key={key}>
                    <span className="offer-title">
                      {title}
                      {companyName && (
                        <>
                          {" – "}
                          <span
                            className="company-name"
                            onClick={() => handleObserveCompany(companyId)}
                            style={{
                              cursor: "pointer",
                              color: observedCompaniesIds.includes(companyId) ? "#f1c40f" : "#3498db",
                              fontWeight: observedCompaniesIds.includes(companyId) ? "bold" : "normal",
                              transition: "color 0.3s ease",
                            }}
                            title={
                              observedCompaniesIds.includes(companyId)
                                ? "Kliknij, aby przestać obserwować firmę"
                                : "Kliknij, aby obserwować firmę"
                            }
                          >
                            {companyName}
                          </span>
                        </>
                      )}
                      {loc && ` (${loc})`}
                    </span>

                    <div className="offer-actions">
                      <span
                        className="star"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSaveOffer(offer.id)}
                      >
                        {savedOffersIds.includes(offer.id) ? "★" : "☆"}
                      </span>

                      {clickedOffersIds.includes(offer.id) ? (
                        <span className="applied-label" style={{ color: "green", fontWeight: "bold" }}>
                          Zaaplikowane
                        </span>
                      ) : (
                        <Link
                          to={`/offerpreview/${offer.id ?? key}`}
                          className="apply-link"
                          onClick={() => setClickedOffersIds((prev) => [...prev, offer.id])}
                        >
                          Aplikuj
                        </Link>
                      )}
                    </div>
                  </div>
                );
              }) : <p>Brak ofert do wyświetlenia.</p>}
            </div>
          </section>
        </main>

        <aside className="filters">
          <div className="filter-group">
            <h4>Poziom stanowiska</h4>
            {availableLevels.map((level) => (
              <label key={level.id ?? level.ID ?? level._id}>
                <input type="checkbox" />
                {level.nazwa ?? level.name ?? "Nieznany poziom"}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Wymiar pracy</h4>
            {availableDimensions.map((dim) => (
              <label key={dim.id ?? dim.ID ?? dim._id}>
                <input type="checkbox" />
                {dim.nazwa ?? dim.name ?? "Nieznany wymiar"}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Tryb pracy</h4>
            {availableModes.map((mode) => (
              <label key={mode.id ?? mode.ID ?? mode._id}>
                <input type="checkbox" />
                {mode.nazwa ?? mode.name ?? "Nieznany tryb"}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Umowa</h4>
            {availableContracts.map((contract) => (
              <label key={contract.id ?? contract.ID ?? contract._id}>
                <input type="checkbox" />
                {contract.nazwa ?? contract.name ?? "Nieznana umowa"}
              </label>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
