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

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/api/kategoriakandydata", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

      alert(`✅ Dodano kategorię: ${res.data.nazwa}`);
      setNewCategory("");
      setShowAddForm(false);
      fetchCategories();
    } catch (err) {
      console.error("❌ Błąd przy dodawaniu kategorii:", err.response?.data || err);
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
      alert("✅ Zmieniono nazwę kategorii.");
      setShowEditForm(false);
      fetchCategories();
    } catch (err) {
      console.error("❌ Błąd przy edycji:", err.response?.data || err);
      alert(err.response?.data?.error || "Nie udało się zaktualizować kategorii.");
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
      alert("🗑️ Kategoria została usunięta.");
      fetchCategories();
    } catch (err) {
      console.error("❌ Błąd przy usuwaniu kategorii:", err.response?.data || err);
      alert(err.response?.data?.error || "Nie udało się usunąć kategorii.");
    }
  };

  if (loading) return <p>Ładowanie kategorii...</p>;

  return (
    <div className="categories-page">
      <EmployeeHeader />

      <div className="categories-content">
        <EmployeeSidebar />

        <main className="categories-main">
          <section className="content-section">
            <h2>Kategorie kandydatów</h2>

            <div className="categories-controls">
              <input
                type="text"
                placeholder="Szukaj kategorii..."
                className="search-input"
              />
              <select className="filter-select">
                <option>Sortuj</option>
                <option>Nazwa A–Z</option>
                <option>Nazwa Z–A</option>
              </select>
              <button className="add-btn" onClick={() => setShowAddForm(true)}>
                ➕ Dodaj kategorię
              </button>
            </div>

            {showAddForm && (
              <form className="add-category-form" onSubmit={handleAddCategory}>
                <input
                  type="text"
                  placeholder="Nazwa nowej kategorii"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
                <button type="submit" className="save-btn">💾 Zapisz</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  ❌ Anuluj
                </button>
              </form>
            )}

            {showEditForm && (
              <form className="edit-category-form" onSubmit={handleEditCategory}>
                <input
                  type="text"
                  value={editCategory.nazwa}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, nazwa: e.target.value })
                  }
                  required
                />
                <button type="submit" className="save-btn">💾 Zapisz zmiany</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditForm(false)}
                >
                  ❌ Anuluj
                </button>
              </form>
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
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3">Brak kategorii.</td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.nazwa}</td>
                      <td>{cat.liczba_kandydatow ?? 0}</td>
                      <td className="options">
                        <button
                          className="edit-btn"
                          onClick={() => startEdit(cat)}
                        >
                          ✏️ Edytuj
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          🗑️ Usuń
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
