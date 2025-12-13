import React, { useState, useEffect } from "react";
import "../../styles/employer/AddOffer.css";
import axios from "axios";

import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";

axios.defaults.baseURL = "http://localhost:5000/api";

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
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [
          modesRes,
          levelsRes,
          dimensionsRes,
          contractsRes,
          categoriesRes,
        ] = await Promise.all([
          axios.get("/tryb", { headers }),
          axios.get("/poziom", { headers }),
          axios.get("/wymiar", { headers }),
          axios.get("/umowa", { headers }),
          axios.get("/kategoriapracy", { headers }),
        ]);
        console.log("Kategorie pracy:", categoriesRes.data);
        setAvailableModes(modesRes.data);
        setAvailableLevels(levelsRes.data);
        setAvailableDimensions(dimensionsRes.data);
        setAvailableContracts(contractsRes.data);
        setAvailableCategories(categoriesRes.data);
      } catch (error) {
        console.error("Błąd pobierania danych słownikowych:", error);
        alert("Nie udało się pobrać danych słownikowych z serwera.");
      } finally {
        setLoading(false);
      }
    };

    fetchDictionaries();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => {
        const prevArr = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...prevArr, value] };
        } else {
          return { ...prev, [name]: prevArr.filter((v) => v !== value) };
        }
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
        "/oferta",
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

      const linkRelations = async (fieldName, endpoint, key) => {
        for (const id of form[fieldName]) {
          try {
            await axios.post(
              endpoint,
              { Ofertaid: ofertaId, [key]: id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error(
              `Błąd dodawania ${endpoint}:`,
              err.response?.data || err
            );
          }
        }
      };

      await linkRelations("modes", "/oferta_tryb", "Trybid");
      await linkRelations("levels", "/oferta_poziom", "Poziomid");
      await linkRelations("dimensions", "/oferta_wymiar", "Wymiarid");
      await linkRelations("contracts", "/oferta_umowa", "Umowaid");

      alert("Oferta oraz powiązania zostały dodane!");

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
          <a href="/employee" className="back-link">← Powrót</a>
          <h2>Dodanie nowej oferty</h2>
          <section className="add-offer-section">
            

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
                  Liczba godzin w tygodniu:
                  <input
                    name="workTime"
                    value={form.workTime}
                    onChange={handleChange}
                    type="number"
                  />
                </label>

                <label>
                  Kategoria pracy:
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">-- Wybierz kategorię --</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.KategoriaPracyid}>
                        {cat.Nazwa}
                      </option>
                    ))}
                  </select>
                </label>

                {loading ? (
                  <p>Ładowanie opcji...</p>
                ) : (
                  <div className="checkbox-row">
                    <div className="checkbox-group">
                      <div className="group-title">Poziom stanowiska</div>
                      {availableLevels.map((lvl) => (
                        <label key={lvl.id}>
                          <input
                            type="checkbox"
                            name="levels"
                            value={String(lvl.id)}
                            checked={form.levels.includes(String(lvl.id))}
                            onChange={handleChange}
                          />
                          {lvl.nazwa || lvl.name}
                        </label>
                      ))}
                    </div>
                    <div className="checkbox-group">
                      <div className="group-title">Wymiar pracy</div>
                      {availableDimensions.map((dim) => (
                        <label key={dim.id}>
                          <input
                            type="checkbox"
                            name="dimensions"
                            value={String(dim.id)}
                            checked={form.dimensions.includes(String(dim.id))}
                            onChange={handleChange}
                          />
                          {dim.nazwa || dim.name}
                        </label>
                      ))}
                    </div>
                    <div className="checkbox-group">
                      <div className="group-title">Tryb pracy</div>
                      {availableModes.map((mode) => (
                        <label key={mode.id}>
                          <input
                            type="checkbox"
                            name="modes"
                            value={String(mode.id)}
                            checked={form.modes.includes(String(mode.id))}
                            onChange={handleChange}
                          />
                          {mode.nazwa || mode.name}
                        </label>
                      ))}
                    </div>
                    <div className="checkbox-group">
                      <div className="group-title">Umowa</div>
                      {availableContracts.map((c) => (
                        <label key={c.id}>
                          <input
                            type="checkbox"
                            name="contracts"
                            value={String(c.id)}
                            checked={form.contracts.includes(String(c.id))}
                            onChange={handleChange}
                          />
                          {c.nazwa || c.name}
                        </label>
                      ))}
                    </div>
                  </div>
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
