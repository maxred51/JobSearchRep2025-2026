import React, { useEffect, useState } from "react";
import EmployeeHeader from "../../components/EmployeeHeader";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/employer/Categories.css";
import axios from "axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState({ id: null, nazwa: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState(""); 

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        "http://localhost:5000/api/kategoriakandydata",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Błąd pobierania kategorii:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user?.id) {
      alert("Brak tokena lub danych użytkownika.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/kategoriakandydata",
        { nazwa: newCategory, PracownikHRid: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Dodano kategorię: ${res.data.nazwa}`);
      setNewCategory("");
      setShowAddForm(false);
      setCategories([...categories, res.data]); 
    } catch (err) {
      console.error(
        "Błąd przy dodawaniu kategorii:",
        err.response?.data || err
      );
      alert(err.response?.data?.error || "Nie udało się dodać kategorii.");
    }
  };

  const startEdit = (cat) => {
    setEditCategory(cat);
    setShowEditForm(true);
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        `http://localhost:5000/api/kategoriakandydata/${editCategory.id}`,
        { nazwa: editCategory.nazwa },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Zmieniono nazwę kategorii.");
      setShowEditForm(false);
      setCategories(
        categories.map((cat) =>
          cat.id === editCategory.id ? { ...cat, nazwa: editCategory.nazwa } : cat
        )
      );
    } catch (err) {
      console.error("Błąd przy edycji:", err.response?.data || err);
      alert(
        err.response?.data?.error || "Nie udało się zaktualizować kategorii."
      );
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę kategorię?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/kategoriakandydata/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Kategoria została usunięta.");
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error("Błąd przy usuwaniu kategorii:", err.response?.data || err);
      alert(err.response?.data?.error || "Nie udało się usunąć kategorii.");
    }
  };

  if (loading) return <p>Ładowanie kategorii...</p>;

  const filteredCategories = categories
    .filter((cat) =>
      cat.nazwa.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") return a.nazwa.localeCompare(b.nazwa);
      if (sortOrder === "desc") return b.nazwa.localeCompare(a.nazwa);
      return 0;
    });

  return (
    <div className="categories-page">
      <EmployeeHeader />
      <div className="categories-content">
        <EmployeeSidebar active="categories" />
        <main className="categories-main">
          <section className="content-section">
            <h2>Kategorie kandydatów</h2>

            <div className="categories-controls">
              <input
                type="text"
                placeholder="Szukaj kategorii..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="filter-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="">Sortuj</option>
                <option value="asc">Nazwa A–Z</option>
                <option value="desc">Nazwa Z–A</option>
              </select>
              <button className="add-btn" onClick={() => setShowAddForm(true)}>
                Dodaj kategorię
              </button>
            </div>

            {showAddForm && (
              <div className="category-form-wrapper">
                <form className="category-form" onSubmit={handleAddCategory}>
                  <h3>Dodaj nową kategorię</h3>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nazwa nowej kategorii"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                  />
                  <div className="form-buttons">
                    <button type="submit" className="save-btn">
                      Zapisz
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAddForm(false)}
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showEditForm && (
              <div className="category-form-wrapper">
                <form className="category-form" onSubmit={handleEditCategory}>
                  <h3>Edytuj kategorię</h3>
                  <input
                    type="text"
                    className="form-input"
                    value={editCategory.nazwa}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        nazwa: e.target.value,
                      })
                    }
                    required
                  />
                  <div className="form-buttons">
                    <button type="submit" className="save-btn">
                      Zapisz zmiany
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowEditForm(false)}
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              </div>
            )}

            <table className="categories-table">
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>Liczba kandydatów</th>
                  <th>Opcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="3">Brak kategorii.</td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.nazwa}</td>
                      <td>{cat.liczba_kandydatow ?? 0}</td>
                      <td className="options">
                        <button
                          className="edit-btn"
                          onClick={() => startEdit(cat)}
                        >
                          Edytuj
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
