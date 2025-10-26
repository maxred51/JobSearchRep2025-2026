import React, { useState, useEffect } from "react";
import "../../styles/employer/addOffer.css";
import axios from "axios";

import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";

axios.defaults.baseURL = "http://localhost:5000/api";

// Dodaj interceptor dla tokena
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default function AddOffer() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    salary: "",
    requirements: "",
    location: "",
    workTime: "",
    category: "",
    position: "",
    modes: [],
    levels: [],
    dimensions: [],
    contracts: [],
  });

  const [availableModes, setAvailableModes] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [availableDimensions, setAvailableDimensions] = useState([]);
  const [availableContracts, setAvailableContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

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
        alert("❌ Nie udało się pobrać danych słownikowych z serwera.");
      } finally {
        setLoading(false);
      }
    };

    fetchDictionaries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleToggle = (field, id) => {
    setForm((prev) => {
      const arr = prev[field].includes(id)
        ? prev[field].filter((x) => x !== id)
        : [...prev[field], id];
      return { ...prev, [field]: arr };
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Brak tokena — zaloguj się ponownie.");
      return;
    }

    const ofertaRes = await axios.post(
      "http://localhost:5000/api/oferta",
      {
        tytuł: form.title,
        opis: form.description,
        wynagrodzenie: parseFloat(form.salary),
        wymagania: form.requirements,
        lokalizacja: form.location,
        czas: parseInt(form.workTime),
        KategoriaPracyid: parseInt(form.category),
        stanowisko: form.position,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const ofertaId = ofertaRes.data.id; 
    if (!ofertaId) {
      alert("Nie udało się uzyskać ID oferty z odpowiedzi serwera.");
      return;
    }


const linkOfertaTryb = async () => {
  for (const id of form.modes) {
    try {
      await axios.post(
        "http://localhost:5000/api/oferta_tryb",
        { Ofertaid: ofertaId, Trybid: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Błąd dodawania oferta_tryb:", err.response?.data || err);
    }
  }
};

const linkOfertaPoziom = async () => {
  for (const id of form.levels) {
    try {
      await axios.post(
        "http://localhost:5000/api/oferta_poziom",
        { Ofertaid: ofertaId, Poziomid: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Błąd dodawania oferta_poziom:", err.response?.data || err);
    }
  }
};

const linkOfertaWymiar = async () => {
  for (const id of form.dimensions) {
    try {
      await axios.post(
        "http://localhost:5000/api/oferta_wymiar",
        { Ofertaid: ofertaId, Wymiarid: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Błąd dodawania oferta_wymiar:", err.response?.data || err);
    }
  }
};

const linkOfertaUmowa = async () => {
  for (const id of form.contracts) {
    try {
      await axios.post(
        "http://localhost:5000/api/oferta_umowa",
        { Ofertaid: ofertaId, Umowaid: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Błąd dodawania oferta_umowa:", err.response?.data || err);
    }
  }
};

await linkOfertaTryb();
await linkOfertaPoziom();
await linkOfertaWymiar();
await linkOfertaUmowa();

    alert("✅ Oferta oraz powiązania zostały dodane!");

    setForm({
      title: "",
      description: "",
      salary: "",
      requirements: "",
      location: "",
      workTime: "",
      category: "",
      position: "",
      modes: [],
      levels: [],
      dimensions: [],
      contracts: [],
    });
  } catch (error) {
    console.error("Błąd:", error);
    alert(error.response?.data?.error || "Błąd dodawania oferty");
  }
};


  return (
    <div className="employee-layout">
      <EmployeeHeader />
      <div className="employee-content">
        <EmployeeSidebar />

        <main className="employee-main">
          <section className="add-offer-section">
            <a href="/employee" className="back-link">
              ← Powrót
            </a>
            <h2>Dodawanie nowej oferty</h2>

            <form className="add-offer-form" onSubmit={handleSubmit}>
              <div className="form-card">
                <label>
                  Tytuł oferty:
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    type="text"
                    placeholder="Tytuł oferty"
                  />
                </label>

                <label>
                  Opis:
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Opis stanowiska"
                  />
                </label>

                <label>
                  Wynagrodzenie:
                  <input
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    type="number"
                    placeholder="np. 4000"
                  />
                </label>

                <label>
                  Wymagania:
                  <textarea
                    name="requirements"
                    value={form.requirements}
                    onChange={handleChange}
                    placeholder="Wymagania"
                  />
                </label>

                <label>
                  Lokalizacja:
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    type="text"
                  />
                </label>

                <label>
                  Czas pracy (w dniach):
                  <input
                    name="workTime"
                    value={form.workTime}
                    onChange={handleChange}
                    type="number"
                  />
                </label>

                <label>
                  Kategoria pracy (ID):
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    type="number"
                  />
                </label>

                {/* 🔹 Checkboxy */}
                {loading ? (
                  <p>Ładowanie opcji...</p>
                ) : (
                  <>
                    <div className="checkbox-group">
                      <div className="group-title">Tryb pracy</div>
                      {availableModes.map((item) => (
                        <label key={item.id}>
                          <input
                            type="checkbox"
                            checked={form.modes.includes(item.id)}
                            onChange={() => handleToggle("modes", item.id)}
                          />
                          {item.nazwa || item.name}
                        </label>
                      ))}
                    </div>

                    <div className="checkbox-group">
                      <div className="group-title">Poziom stanowiska</div>
                      {availableLevels.map((item) => (
                        <label key={item.id}>
                          <input
                            type="checkbox"
                            checked={form.levels.includes(item.id)}
                            onChange={() => handleToggle("levels", item.id)}
                          />
                          {item.nazwa || item.name}
                        </label>
                      ))}
                    </div>

                    <div className="checkbox-group">
                      <div className="group-title">Wymiar pracy</div>
                      {availableDimensions.map((item) => (
                        <label key={item.id}>
                          <input
                            type="checkbox"
                            checked={form.dimensions.includes(item.id)}
                            onChange={() => handleToggle("dimensions", item.id)}
                          />
                          {item.nazwa || item.name}
                        </label>
                      ))}
                    </div>

                    <div className="checkbox-group">
                      <div className="group-title">Rodzaj umowy</div>
                      {availableContracts.map((item) => (
                        <label key={item.id}>
                          <input
                            type="checkbox"
                            checked={form.contracts.includes(item.id)}
                            onChange={() => handleToggle("contracts", item.id)}
                          />
                          {item.nazwa || item.name}
                        </label>
                      ))}
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn-add">
                    Dodaj
                  </button>
                </div>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
