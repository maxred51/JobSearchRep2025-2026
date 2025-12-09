import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/admin/JobOfferEdit.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";

const JobOfferEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    salary: "",
    requirements: "",
    location: "",
    workTime: "",
    category: "",
    position: "",
    active: true,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const resOffer = await axios.get(`http://localhost:5000/api/oferta/${id}`, { headers });
        const d = resOffer.data;

        const [modesRes, levelsRes, dimensionsRes, contractsRes, categoriesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/tryb", { headers }),
          axios.get("http://localhost:5000/api/poziom", { headers }),
          axios.get("http://localhost:5000/api/wymiar", { headers }),
          axios.get("http://localhost:5000/api/umowa", { headers }),
          axios.get("http://localhost:5000/api/kategoriapracy", { headers }),
        ]);

        setAvailableModes(modesRes.data);
        setAvailableLevels(levelsRes.data);
        setAvailableDimensions(dimensionsRes.data);
        setAvailableContracts(contractsRes.data);
        setAvailableCategories(categoriesRes.data);

        const resLinks = await axios.get(`http://localhost:5000/api/oferta/${id}/powiazania`, {
          headers,
        });

        setForm({
          title: d.tytul ?? "",
          description: d.opis ?? "",
          salary: d.wynagrodzenie !== undefined ? String(d.wynagrodzenie) : "",
          requirements: d.wymagania ?? "",
          location: d.lokalizacja ?? "",
          workTime: d.czas !== undefined ? String(d.czas) : "",
          category: d.KategoriaPracyid !== undefined ? String(d.KategoriaPracyid) : "",
          active: d.aktywna === undefined ? true : !!d.aktywna,
          modes: resLinks.data.tryby.map(String) || [],
          levels: resLinks.data.poziomy.map(String) || [],
          dimensions: resLinks.data.wymiary.map(String) || [],
          contracts: resLinks.data.umowy.map(String) || [],
        });
      } catch (err) {
        console.error("Błąd pobierania danych oferty:", err.response?.data || err);
        alert("Nie udało się pobrać danych oferty.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (type === "checkbox" && !["active"].includes(name)) {
      setForm((prev) => {
        const arr = prev[name].includes(value)
          ? prev[name].filter((x) => x !== value)
          : [...prev[name], value];
        return { ...prev, [name]: arr };
      });
    } else if (type === "checkbox" && name === "active") {
      setForm((prev) => ({ ...prev, active: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Brak tokena — zaloguj się ponownie.");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    console.log("Dane wysyłane do backendu:", form);

    try {
      await axios.put(
        `http://localhost:5000/api/oferta/${id}`,
        {
          tytuł: form.title,
          opis: form.description,
          wynagrodzenie: parseFloat(form.salary) || 0,
          wymagania: form.requirements,
          lokalizacja: form.location,
          czas: parseInt(form.workTime),
          aktywna: form.active,
          KategoriaPracyid: form.category ? parseInt(form.category) : null,
        },
        { headers }
      );

      const updateLinks = async (type, values, key) => {
        const res = await axios.get(`http://localhost:5000/api/oferta/${id}/powiazania`, { headers });

        const typeMap = {
          oferta_tryb: "tryby",
          oferta_poziom: "poziomy",
          oferta_wymiar: "wymiary",
          oferta_umowa: "umowy",
        };

        const current = res.data[typeMap[type]] || [];

        for (const val of current) {
          try {
            await axios.delete(`http://localhost:5000/api/${type}/${id}/${val}`, { headers });
          } catch (err) {
            console.warn(`Nie udało się usunąć powiązania ${type}:`, err);
          }
        }

        for (const val of values) {
          await axios.post(
            `http://localhost:5000/api/${type}`,
            { Ofertaid: id, [key]: val },
            { headers }
          );
        }
      };

      await updateLinks("oferta_tryb", form.modes, "Trybid");
      await updateLinks("oferta_poziom", form.levels, "Poziomid");
      await updateLinks("oferta_wymiar", form.dimensions, "Wymiarid");
      await updateLinks("oferta_umowa", form.contracts, "Umowaid");

      alert("Oferta została pomyślnie zaktualizowana!");
      navigate("/offersadmin");
    } catch (err) {
      console.error("Błąd przy aktualizacji oferty:", err.response?.data || err);
      alert(err.response?.data?.error || "Nie udało się zaktualizować oferty.");
    }
  };

  if (loading) return <p className="loading">Ładowanie danych oferty...</p>;

  return (
    <div className="job-edit-layout">
      <AdminHeader />
      <div className="job-edit-body">
        <AdminSidebar active="jobs" />

        <main className="offer-edit-main">
          <section className="offer-edit-section">
            <a href="/offersadmin" className="back-link">← Powrót</a>
            <h2>Edycja oferty pracy</h2>

            <form onSubmit={handleSubmit} className="offer-form">
              <label>Tytuł oferty:<input type="text" name="title" value={form.title} onChange={handleChange} /></label>
              <label>Opis:<textarea name="description" value={form.description} onChange={handleChange} /></label>
              <label>Wynagrodzenie:<input type="text" name="salary" value={form.salary} onChange={handleChange} /></label>
              <label>Wymagania:<textarea name="requirements" value={form.requirements} onChange={handleChange} /></label>
              <label>Lokalizacja:<input type="text" name="location" value={form.location} onChange={handleChange} /></label>
              <label>Liczba godzin w tygodniu:<input type="text" name="workTime" value={form.workTime} onChange={handleChange} /></label>
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

              <div className="checkbox-row">
                <div className="checkbox-group">
                  <div className="group-title">Poziom stanowiska</div>
                  {availableLevels.map(lvl => (
                    <label key={lvl.id}>
                      <input type="checkbox" name="levels" value={String(lvl.id)} checked={form.levels.includes(String(lvl.id))} onChange={handleChange}/>
                      {lvl.nazwa || lvl.name}
                    </label>
                  ))}
                </div>
                <div className="checkbox-group">
                  <div className="group-title">Wymiar pracy</div>
                  {availableDimensions.map(dim => (
                    <label key={dim.id}>
                      <input type="checkbox" name="dimensions" value={String(dim.id)} checked={form.dimensions.includes(String(dim.id))} onChange={handleChange}/>
                      {dim.nazwa || dim.name}
                    </label>
                  ))}
                </div>
                <div className="checkbox-group">
                  <div className="group-title">Tryb pracy</div>
                  {availableModes.map(mode => (
                    <label key={mode.id}>
                      <input type="checkbox" name="modes" value={String(mode.id)} checked={form.modes.includes(String(mode.id))} onChange={handleChange}/>
                      {mode.nazwa || mode.name}
                    </label>
                  ))}
                </div>
                <div className="checkbox-group">
                  <div className="group-title">Umowa</div>
                  {availableContracts.map(c => (
                    <label key={c.id}>
                      <input type="checkbox" name="contracts" value={String(c.id)} checked={form.contracts.includes(String(c.id))} onChange={handleChange}/>
                      {c.nazwa || c.name}
                    </label>
                  ))}
                </div>
              </div>

              <label>
                Aktywna:
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
              </label>

              <button type="submit" className="btn-submit">💾 Zapisz zmiany</button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default JobOfferEdit;
