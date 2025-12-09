export default function Home() {
  return (
    <section className="hero">
      <h1>Witamy w JobFinder</h1>
      <p>Prosty szkic aplikacji wyszukującej oferty pracy — kandydat / pracodawca / admin.</p>
      <div className="cta-row">
        <a href="/login" className="btn">Zaloguj się</a>
      </div>
    </section>
  );
}
