<<<<<<< HEAD
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="navbar">
        <div className="container nav-inner">
          <Link to="/" className="brand">JobFinder</Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/login" className="btn-small">Logowanie</Link>
          </nav>
        </div>
      </header>

      <main className="container content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} JobFinder</div>
      </footer>
    </div>
  );
}
=======
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="navbar">
        <div className="container nav-inner">
          <Link to="/" className="brand">JobFinder</Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/login" className="btn-small">Logowanie</Link>
          </nav>
        </div>
      </header>

      <main className="container content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} JobFinder</div>
      </footer>
    </div>
  );
}
>>>>>>> def9ccd (Poprawki)
