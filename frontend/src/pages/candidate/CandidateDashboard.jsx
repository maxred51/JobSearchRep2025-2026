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

  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedModes, setSelectedModes] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [selectedContracts, setSelectedContracts] = useState([]);

  const [availableCategories, setAvailableCategories] = useState([]);
const [selectedCategory, setSelectedCategory] = useState("");


  useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Pobranie ofert, zapisanych ofert, obserwowanych firm i kategorii
      const [offersRes, savedRes, observedRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/oferta", { headers }),
        axios.get("http://localhost:5000/api/zapisana_oferta", { headers }),
        axios.get("http://localhost:5000/api/obserwowana_firma", { headers }),
        axios.get("http://localhost:5000/api/kategoriapracy", { headers })
      ]);

      // Mapowanie GROUP_CONCAT na tablice (jeśli backend zwraca tryby_ids itd.)
      const mappedOffers = offersRes.data.map(r => ({
        ...r,
        tryby: r.tryby_ids
          ? r.tryby_ids.split(',').map((id, i) => ({ id: Number(id), nazwa: r.tryby_nazwy.split(',')[i] }))
          : [],
        poziomy: r.poziomy_ids
          ? r.poziomy_ids.split(',').map((id, i) => ({ id: Number(id), nazwa: r.poziomy_nazwy.split(',')[i] }))
          : [],
        wymiary: r.wymiary_ids
          ? r.wymiary_ids.split(',').map((id, i) => ({ id: Number(id), nazwa: r.wymiary_nazwy.split(',')[i] }))
          : [],
        umowy: r.umowy_ids
          ? r.umowy_ids.split(',').map((id, i) => ({ id: Number(id), nazwa: r.umowy_nazwy.split(',')[i] }))
          : []
      }));

      setOffers(mappedOffers);
      setFilteredOffers(mappedOffers);
      setSavedOffersIds(savedRes.data.map((o) => o.id));
      setObservedCompaniesIds(observedRes.data.map((c) => c.id));
      setAvailableCategories(categoriesRes.data);

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
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json; charset=utf-8",
          "Content-Type": "application/json; charset=utf-8",
        };

        const [modesRes, levelsRes, dimensionsRes, contractsRes] =
          await Promise.all([
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
        await axios.delete(
          `http://localhost:5000/api/zapisana_oferta/${offerId}`,
          { headers }
        );
        setSavedOffersIds((prev) => prev.filter((id) => id !== offerId));
      } else {
        await axios.post(
          "http://localhost:5000/api/zapisana_oferta",
          { Ofertaid: offerId },
          { headers }
        );
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
        await axios.delete(
          `http://localhost:5000/api/obserwowana_firma/${companyId}`,
          { headers }
        );
        setObservedCompaniesIds((prev) =>
          prev.filter((id) => id !== companyId)
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/obserwowana_firma",
          { Firmaid: companyId },
          { headers }
        );
        setObservedCompaniesIds((prev) => [...prev, companyId]);
      }
    } catch (error) {
      console.error("Błąd przy obserwowaniu firmy:", error);
      alert("Nie udało się dodać firmy do obserwowanych.");
    }
  };

  useEffect(() => {
  if (offers.length > 0) {
    console.log("PRZYKŁADOWA OFERTA:", offers[0]);
  }
}, [offers]);


  const getOfferKey = (offer, index) =>
    offer.id ??
    offer.ID ??
    offer._id ??
    `${offer.tytul ?? offer.title ?? "offer"}-${index}`;
  const getOfferTitle = (offer) =>
    offer.tytul ?? offer.title ?? offer.nazwa ?? offer.name ?? "Brak tytułu";
  const getOfferLocation = (offer) => offer.lokalizacja ?? offer.location ?? "";
  const getCompanyId = (offer) =>
    offer.Firmaid ??
    offer.firmaid ??
    offer.companyId ??
    offer.company?.id ??
    offer.firma?.id ??
    null;
  const getCompanyName = (offer) =>
    offer.nazwa_firmy ??
    offer.firma ??
    offer.company ??
    offer.companyName ??
    offer.company?.nazwa_firmy ??
    "Nieznana firma";

  const normalize = (str = "") =>
    str
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const toggleSelection = (setFn, value) => {
  setFn((prev) =>
    prev.includes(value)
      ? prev.filter((v) => v !== value)
      : [...prev, value]
  );
};

useEffect(() => {
  const filtered = offers.filter((offer) => {
    const title = normalize(offer.tytul);
    const locationText = normalize(offer.lokalizacja);

    const matchesText = !searchTerm || title.includes(normalize(searchTerm));
    const matchesLocation = !location || locationText.includes(normalize(location));

    const matchesLevels =
      selectedLevels.length === 0 ||
      offer.poziomy?.some((p) => selectedLevels.includes(p.id));

    const matchesModes =
      selectedModes.length === 0 ||
      offer.tryby?.some((t) => selectedModes.includes(t.id));

    const matchesDimensions =
      selectedDimensions.length === 0 ||
      offer.wymiary?.some((w) => selectedDimensions.includes(w.id));

    const matchesContracts =
      selectedContracts.length === 0 ||
      offer.umowy?.some((u) => selectedContracts.includes(u.id));

    const offerCategoryId = offer.KategoriaPracyid ?? offer.kategoria?.id;
    const matchesCategory =
      !selectedCategory || offerCategoryId === Number(selectedCategory);

    return (
      matchesText &&
      matchesLocation &&
      matchesCategory &&
      matchesLevels &&
      matchesModes &&
      matchesDimensions &&
      matchesContracts
    );
  });

  setFilteredOffers(filtered);
}, [
  searchTerm,
  location,
  selectedLevels,
  selectedModes,
  selectedDimensions,
  selectedContracts,
  selectedCategory,
  offers,
]);



  if (loading) return <p>Ładowanie danych...</p>;

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
              <select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
>
  <option value="">Wszystkie kategorie</option>
  {availableCategories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.Nazwa}
    </option>
  ))}
</select>


              <input
                type="text"
                placeholder="Lokalizacja"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="offers-list">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer, idx) => {
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
                                color: observedCompaniesIds.includes(companyId)
                                  ? "#f1c40f"
                                  : "#3498db",
                                fontWeight: observedCompaniesIds.includes(
                                  companyId
                                )
                                  ? "bold"
                                  : "normal",
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
                          <span
                            className="applied-label"
                            style={{ color: "green", fontWeight: "bold" }}
                          >
                            Zaaplikowane
                          </span>
                        ) : (
                          <Link
                            to={`/offerpreview/${offer.id ?? key}`}
                            className="apply-link"
                            onClick={() =>
                              setClickedOffersIds((prev) => [...prev, offer.id])
                            }
                          >
                            Aplikuj
                          </Link>
                        )}
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
            {availableLevels.map((level) => (
              <label key={level.id}>
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(level.id)}
                  onChange={() => toggleSelection(setSelectedLevels, level.id)}
                />
                {level.nazwa}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Wymiar pracy</h4>
            {availableModes.map((mode) => (
              <label key={mode.id}>
                <input
                  type="checkbox"
                  checked={selectedModes.includes(mode.id)}
                  onChange={() => toggleSelection(setSelectedModes, mode.id)}
                />
                {mode.nazwa}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Tryb pracy</h4>
            {availableDimensions.map((dim) => (
              <label key={dim.id}>
                <input
                  type="checkbox"
                  checked={selectedDimensions.includes(dim.id)}
                  onChange={() =>
                    toggleSelection(setSelectedDimensions, dim.id)
                  }
                />
                {dim.nazwa}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Umowa</h4>
            {availableContracts.map((contract) => (
              <label key={contract.id}>
                <input
                  type="checkbox"
                  checked={selectedContracts.includes(contract.id)}
                  onChange={() =>
                    toggleSelection(setSelectedContracts, contract.id)
                  }
                />
                {contract.nazwa}
              </label>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
