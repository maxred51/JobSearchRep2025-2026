import React, { useState } from "react";
import "../../styles/admin/JobOfferEdit.css";
import AdminHeader from "../../components/AdminHeader";
import AdminSidebar from "../../components/AdminSidebar";

const JobOfferEdit = () => {
  const [form, setForm] = useState({
    title: "Specjalista ds. administracji",
    description: "",
    salary: "",
    requirements: "",
    location: "",
    time: "",
    category: "",
    position: "",
    level: [],
    workType: [],
    mode: [],
    contract: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => {
        const arr = prev[name];
        return {
          ...prev,
          [name]: checked
            ? [...arr, value]
            : arr.filter((item) => item !== value),
        };
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Edytowana oferta:", form);
    alert("Oferta została zaktualizowana!");
  };

  return (
    <div className="job-edit-layout">
      <AdminHeader/>

      <div className="job-edit-body">
        <AdminSidebar active="jobs"/>

        <main className="offer-edit-main">
          <section className="offer-edit-section">
            <a href="/offermanage" className="back-link">← Powrót</a>
            <h2>Edycja oferty</h2>
            <form onSubmit={handleSubmit} className="offer-form">
              <label>Tytuł oferty:</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
              />

              <label>Opis:</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />

              <label>Wynagrodzenie:</label>
              <input
                type="text"
                name="salary"
                value={form.salary}
                onChange={handleChange}
              />

              <label>Wymagania:</label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
              />

              <label>Lokalizacja:</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
              />

              <label>Czas pracy:</label>
              <input
                type="text"
                name="time"
                value={form.time}
                onChange={handleChange}
              />

              <label>Kategoria pracy:</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
              />

              <label>Stanowisko:</label>
              <input
                type="text"
                name="position"
                value={form.position}
                onChange={handleChange}
              />

              <div className="checkbox-group">
                <label>Poziom stanowiska:</label>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="level"
                      value="Junior"
                      onChange={handleChange}
                    />{" "}
                    Junior
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="level"
                      value="Senior"
                      onChange={handleChange}
                    />{" "}
                    Senior
                  </label>
                </div>
              </div>

              <div className="checkbox-group">
                <label>Wymiar pracy:</label>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="workType"
                      value="Pełny etat"
                      onChange={handleChange}
                    />{" "}
                    Pełny etat
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="workType"
                      value="Część etatu"
                      onChange={handleChange}
                    />{" "}
                    Część etatu
                  </label>
                </div>
              </div>

              <div className="checkbox-group">
                <label>Tryb pracy:</label>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="mode"
                      value="Stacjonarna"
                      onChange={handleChange}
                    />{" "}
                    Stacjonarna
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="mode"
                      value="Zdalna"
                      onChange={handleChange}
                    />{" "}
                    Zdalna
                  </label>
                </div>
              </div>

              <div className="checkbox-group">
                <label>Umowa:</label>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="contract"
                      value="Umowa o pracę"
                      onChange={handleChange}
                    />{" "}
                    Umowa o pracę
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="contract"
                      value="B2B"
                      onChange={handleChange}
                    />{" "}
                    B2B
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-submit">
                Zapisz zmiany
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default JobOfferEdit;
