import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/candidate/CandidateDashboard.css";
import CandidateSidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function CandidateDashboard() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/oferta", {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        console.log("Pobrane oferty (surowe):", response.data);
        setOffers(response.data || []);
        setFilteredOffers(response.data || []);
      } catch (error) {
        console.error("Błąd podczas pobierania ofert:", error);
      }
    };
    fetchOffers();
  }, []);

  const handleSearch = () => {
    const filtered = offers.filter((offer) => {
      const title = (offer.tytul ?? offer.title ?? offer.nazwa ?? "").toString().toLowerCase();
      const offerCategory = (offer.kategoria ?? offer.category ?? "").toString().toLowerCase();
      const offerLocation = (offer.lokalizacja ?? offer.location ?? "").toString().toLowerCase();

      const matchesSearch = title.includes(searchTerm.toLowerCase());
      const matchesCategory = category ? offerCategory === category.toLowerCase() : true;
      const matchesLocation = location ? offerLocation.includes(location.toLowerCase()) : true;

      return matchesSearch && matchesCategory && matchesLocation;
    });

    setFilteredOffers(filtered);
  };

  const getOfferKey = (offer, index) =>
    offer.id ?? offer.ID ?? offer._id ?? `${(offer.tytul ?? offer.title ?? "offer")}-${index}`;

  const getOfferTitle = (offer) =>
    offer.tytul ?? offer.title ?? offer.nazwa ?? offer.name ?? "Brak tytułu";

  const getOfferLocation = (offer) =>
    offer.lokalizacja ?? offer.location ?? "";

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        <CandidateSidebar active="overview" />

        <main className="main-content">
          <section className="offers-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Szukaj ofert..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Kategoria</option>
                <option value="IT">IT</option>
                <option value="Sprzedaż">Sprzedaż</option>
                <option value="Produkcja">Produkcja</option>
              </select>

              <input
                type="text"
                placeholder="Lokalizacja"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <button className="search-btn" onClick={handleSearch}>🔍</button>
            </div>

            <div className="offers-list">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer, idx) => {
                  const key = getOfferKey(offer, idx);
                  const title = getOfferTitle(offer);
                  const loc = getOfferLocation(offer);
                  const company = offer.firma ?? offer.company ?? "";

                  return (
                    <div className="offer" key={key}>
                      <span className="offer-title">
                        {title}
                        {company ? ` – ${company}` : ""}
                        {loc ? ` (${loc})` : ""}
                      </span>
                      <div className="offer-actions">
                        <span className="star">☆</span>
                        <a
                          href={`/offerpreview/${offer.id ?? offer._id ?? key}`}
                          className="apply-link"
                        >
                          Aplikuj
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Brak ofert do wyświetlenia.</p>
              )}
            </div>
          </section>
        </main>

        <aside className="filters">
          <div className="filter-group">
            <h4>Poziom stanowiska</h4>
            <label><input type="checkbox" /> Junior</label>
            <label><input type="checkbox" /> Senior</label>
          </div>

          <div className="filter-group">
            <h4>Wymiar pracy</h4>
            <label><input type="checkbox" /> Pełny etat</label>
            <label><input type="checkbox" /> Część etatu</label>
          </div>

          <div className="filter-group">
            <h4>Tryb pracy</h4>
            <label><input type="checkbox" /> Stacjonarna</label>
            <label><input type="checkbox" /> Zdalna</label>
          </div>

          <div className="filter-group">
            <h4>Umowa</h4>
            <label><input type="checkbox" /> Umowa o pracę</label>
            <label><input type="checkbox" /> B2B</label>
          </div>
        </aside>
      </div>
    </div>
  );
}
