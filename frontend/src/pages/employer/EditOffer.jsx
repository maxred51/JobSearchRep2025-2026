<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import "../../styles/employer/EditOffer.css";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import axios from "axios";

export default function EditOffer() {
  const { id } = useParams();

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resOffer = await axios.get(`/oferta/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = resOffer.data;

        const [modesRes, levelsRes, dimensionsRes, contractsRes, categoriesRes] = await Promise.all([
          axios.get("/tryb", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/poziom", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/wymiar", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/umowa", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/kategoriapracy", { headers:  { Authorization: `Bearer ${token}` } }),
        ]);

        setAvailableModes(modesRes.data);
        setAvailableLevels(levelsRes.data);
        setAvailableDimensions(dimensionsRes.data);
        setAvailableContracts(contractsRes.data);
        setAvailableCategories(categoriesRes.data);

        const resLinks = await axios.get(`/oferta/${id}/powiazania`, {
          headers: { Authorization: `Bearer ${token}` },
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
        console.error("Błąd pobierania oferty:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
  const { name, type, value, checked } = e.target;

  if (["modes", "levels", "dimensions", "contracts"].includes(name)) {
    setForm((prev) => {
      const arr = prev[name].includes(value)
        ? prev[name].filter((x) => x !== value)
        : [...prev[name], value];
      return { ...prev, [name]: arr };
    });
  } 
  else if (type === "checkbox") {
    setForm((prev) => ({ ...prev, [name]: checked }));
  } 
  else {
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
          aktywna: form.active ? 1 : 0, 
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
    } catch (err) {
      console.error("Błąd przy aktualizacji oferty:", err.response?.data || err);
      alert(err.response?.data?.error || "Nie udało się zaktualizować oferty.");
    }
  };

  if (loading) return <p>Ładowanie opcji...</p>;

  return (
    <div className="edit-offer-page">
      <Header />
      <div className="edit-offer-content">
        <EmployeeSidebar />
        <main className="edit-offer-main">
          <a href="/employee" className="back-link">← Powrót</a>
          <h2>Edytowanie oferty</h2>
          <form className="edit-offer-form" onSubmit={handleSubmit}>
            <div className="form-card">
              <label>Tytuł oferty:<input name="title" value={form.title} onChange={handleChange} type="text"/></label>
              <label>Opis:<textarea name="description" value={form.description} onChange={handleChange}/></label>
              <label>Wynagrodzenie:<input name="salary" value={form.salary} onChange={handleChange} type="text"/></label>
              <label>Wymagania:<textarea name="requirements" value={form.requirements} onChange={handleChange}/></label>
              <label>Lokalizacja:<input name="location" value={form.location} onChange={handleChange} type="text"/></label>
              <label>Liczba godzin w tygodniu:<input name="workTime" value={form.workTime} onChange={handleChange} type="text"/></label>
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

              <label>Aktywna:<input type="checkbox" name="active" checked={form.active} onChange={handleChange}/></label>
              <div className="form-actions"><button type="submit" className="btn-edit">Edytuj</button></div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
=======
import React, { useState, useEffect } from "react";
import "../../styles/employer/EditOffer.css";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import axios from "axios";

export default function EditOffer() {
  const { id } = useParams();

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resOffer = await axios.get(`/oferta/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = resOffer.data;

        const [modesRes, levelsRes, dimensionsRes, contractsRes, categoriesRes] = await Promise.all([
          axios.get("/tryb", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/poziom", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/wymiar", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/umowa", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/kategoriapracy", { headers:  { Authorization: `Bearer ${token}` } }),
        ]);

        setAvailableModes(modesRes.data);
        setAvailableLevels(levelsRes.data);
        setAvailableDimensions(dimensionsRes.data);
        setAvailableContracts(contractsRes.data);
        setAvailableCategories(categoriesRes.data);

        const resLinks = await axios.get(`/oferta/${id}/powiazania`, {
          headers: { Authorization: `Bearer ${token}` },
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
        console.error("Błąd pobierania oferty:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
  const { name, type, value, checked } = e.target;

  if (["modes", "levels", "dimensions", "contracts"].includes(name)) {
    setForm((prev) => {
      const arr = prev[name].includes(value)
        ? prev[name].filter((x) => x !== value)
        : [...prev[name], value];
      return { ...prev, [name]: arr };
    });
  } 
  else if (type === "checkbox") {
    setForm((prev) => ({ ...prev, [name]: checked }));
  } 
  else {
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
          aktywna: form.active ? 1 : 0, 
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
    } catch (err) {
      console.error("Błąd przy aktualizacji oferty:", err.response?.data || err);
      alert(err.response?.data?.error || "Nie udało się zaktualizować oferty.");
    }
  };

  if (loading) return <p>Ładowanie opcji...</p>;

  return (
    <div className="edit-offer-page">
      <Header />
      <div className="edit-offer-content">
        <EmployeeSidebar />
        <main className="edit-offer-main">
          <a href="/employee" className="back-link">← Powrót</a>
          <h2>Edytowanie oferty</h2>
          <form className="edit-offer-form" onSubmit={handleSubmit}>
            <div className="form-card">
              <label>Tytuł oferty:<input name="title" value={form.title} onChange={handleChange} type="text"/></label>
              <label>Opis:<textarea name="description" value={form.description} onChange={handleChange}/></label>
              <label>Wynagrodzenie:<input name="salary" value={form.salary} onChange={handleChange} type="text"/></label>
              <label>Wymagania:<textarea name="requirements" value={form.requirements} onChange={handleChange}/></label>
              <label>Lokalizacja:<input name="location" value={form.location} onChange={handleChange} type="text"/></label>
              <label>Liczba godzin w tygodniu:<input name="workTime" value={form.workTime} onChange={handleChange} type="text"/></label>
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

              <label>Aktywna:<input type="checkbox" name="active" checked={form.active} onChange={handleChange}/></label>
              <div className="form-actions"><button type="submit" className="btn-edit">Edytuj</button></div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
>>>>>>> def9ccd (Poprawki)
