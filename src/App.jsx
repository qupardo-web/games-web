import { useEffect, useRef, useState } from "react";

const GENRES = ["RPG", "Shooter", "Puzzle"];
const FILTERS = ["Todos", ...GENRES];
const MIN_YEAR = 1958;
const MAX_YEAR = new Date().getFullYear();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const EMPTY_FORM = { title: "", genre: "", year: "" };

function initials(title) {
  return title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 4h4M6 7l1.1 13h9.8L18 7M10 11v6M14 11v6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 10l5 5 5-5" />
    </svg>
  );
}

function GamepadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.6 8h10.8a4.4 4.4 0 0 1 4.3 5.3l-.7 3.4a2.5 2.5 0 0 1-4.4 1.1L15.4 17H8.6l-1.2 1.3a2.5 2.5 0 0 1-4.4-1.1L2.3 13A4.4 4.4 0 0 1 6.6 8Z" />
      <path d="M8 11.5v3M6.5 13h3M15.8 11.6h.01M17.8 13.6h.01" />
    </svg>
  );
}

function FunnelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16l-6.2 7.4V19l-3.6-2.2v-4.4L4 5Z" />
    </svg>
  );
}

function GameCard({ game, onRemove }) {
  return (
    <li>
      <article className="card" data-od-id={"game-card-" + game.id}>
        <div className="card-top">
          <span className="card-mark" aria-hidden="true">{initials(game.title)}</span>
          <button
            type="button"
            className="icon-btn"
            aria-label={"Eliminar " + game.title}
            onClick={() => onRemove(game.id)}
          >
            <TrashIcon />
          </button>
        </div>
        <h2>{game.title}</h2>
        <div className="card-meta">
          <span className="pill">{game.genre}</span>
          <span className="year">{game.year}</span>
        </div>
      </article>
    </li>
  );
}

function GameForm({ form, setForm, formValid, titleRef, onSubmit, onCancel }) {
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <header className="modal-head">
        <p className="eyebrow">Nuevo</p>
        <h2 id="game-modal-title">Agregar juego</h2>
        <button type="button" className="icon-btn" aria-label="Cerrar" onClick={onCancel}>
          <CloseIcon />
        </button>
      </header>

      <div className="modal-body">
        <div className="field">
          <label htmlFor="game-title">Título</label>
          <input
            id="game-title"
            ref={titleRef}
            type="text"
            value={form.title}
            maxLength={60}
            required
            autoComplete="off"
            placeholder="p. ej. Silent Cascade"
            onChange={(event) => update("title", event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="game-genre">Género</label>
          <div className="select-wrap">
            <select
              id="game-genre"
              value={form.genre}
              required
              onChange={(event) => update("genre", event.target.value)}
            >
              <option value="" disabled>Selecciona un género</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        <div className="field">
          <label htmlFor="game-year">Año</label>
          <input
            id="game-year"
            type="number"
            value={form.year}
            required
            min={MIN_YEAR}
            max={MAX_YEAR}
            inputMode="numeric"
            placeholder={String(MAX_YEAR)}
            onChange={(event) => update("year", event.target.value)}
          />
          <span className="hint">Entre {MIN_YEAR} y {MAX_YEAR}</span>
        </div>
      </div>

      {!formValid && (
        <p className="form-note">Completa título, género y año para guardar.</p>
      )}

      <footer className="modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={!formValid}>
          Guardar juego
        </button>
      </footer>
    </form>
  );
}

function App() {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const openerRef = useRef(null);

  const visible = filter === "Todos" ? games : games.filter((game) => game.genre === filter);
  const total = games.length;
  const yearNumber = Number(form.year);
  const formValid =
    form.title.trim().length > 0 &&
    form.genre !== "" &&
    /^\d{4}$/.test(form.year.trim()) &&
    yearNumber >= MIN_YEAR &&
    yearNumber <= MAX_YEAR;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modalOpen && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => {
        if (titleRef.current) titleRef.current.focus();
      });
    } else if (!modalOpen && dialog.open) {
      dialog.close();
    }
  }, [modalOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        const response = await fetch(`${API_URL}/games`);
        if (!response.ok) throw new Error("No se pudo cargar el catálogo.");
        const data = await response.json();
        if (!cancelled) {
          setGames(data);
          setError("");
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    setStatus("loading");
    loadGames();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function openModal(event) {
    openerRef.current = event.currentTarget;
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleDialogClose() {
    setModalOpen(false);
    if (openerRef.current) openerRef.current.focus();
  }

  function handleBackdrop(event) {
    if (event.target === dialogRef.current) closeModal();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formValid) return;

    try {
      const response = await fetch(`${API_URL}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          genre: form.genre,
          year: yearNumber,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error || "No se pudo guardar el juego.");
        return;
      }

      setGames((prev) => [body, ...prev]);
      setFilter("Todos");
      setForm(EMPTY_FORM);
      setError("");
      closeModal();
    } catch {
      setError("No se pudo conectar con la API.");
    }
  }

  async function removeGame(id) {
    try {
      const response = await fetch(`${API_URL}/games/${id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        throw new Error("No se pudo eliminar el juego.");
      }
      setGames((prev) => prev.filter((game) => game.id !== id));
      setError("");
    } catch {
      setError("No se pudo conectar con la API.");
    }
  }

  return (
    <div className="app">
      <header className="topbar" data-od-id="page-header">
        <div className="shell topbar-inner">
          <div>
            <p className="eyebrow">Catálogo</p>
            <div className="title-line">
              <h1>Mis Juegos</h1>
              <span className="count">{total} {total === 1 ? "juego" : "juegos"}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            data-od-id="add-game-button"
            aria-haspopup="dialog"
            onClick={openModal}
          >
            <PlusIcon />
            Agregar juego
          </button>
        </div>
      </header>

      <main className="shell main">
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filtrar por género" data-od-id="genre-filters">
            {FILTERS.map((genre) => (
              <button
                key={genre}
                type="button"
                className="chip"
                aria-pressed={filter === genre}
                onClick={() => setFilter(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
          <p className="result-count" aria-live="polite">
            {visible.length} de {total}
          </p>
        </div>

        {error && status === "ready" && (
          <p className="form-note" role="alert">{error}</p>
        )}

        {status === "loading" && (
          <p className="result-count">Cargando catálogo...</p>
        )}

        {status === "error" && (
          <section className="empty" role="alert">
            <h2>No se pudo cargar el catálogo</h2>
            <p>{error}</p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setReloadKey((value) => value + 1)}
              >
                Reintentar
              </button>
            </div>
          </section>
        )}

        {status === "ready" && (total === 0 ? (
          <section className="empty" data-od-id="empty-library" aria-labelledby="empty-library-title">
            <span className="empty-icon"><GamepadIcon /></span>
            <h2 id="empty-library-title">Tu biblioteca está vacía</h2>
            <p>Agrega tu primer juego y empieza a armar el catálogo por género.</p>
            <div className="empty-actions">
              <button type="button" className="btn btn-primary" onClick={openModal}>
                <PlusIcon />
                Agregar juego
              </button>
            </div>
          </section>
        ) : visible.length === 0 ? (
          <section className="empty" data-od-id="empty-filter" aria-labelledby="empty-filter-title">
            <span className="empty-icon"><FunnelIcon /></span>
            <h2 id="empty-filter-title">Sin juegos de {filter}</h2>
            <p>Todavía no hay títulos de {filter} en tu biblioteca.</p>
            <div className="empty-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setFilter("Todos")}>
                Ver todos los juegos
              </button>
            </div>
          </section>
        ) : (
          <ul className="grid" data-od-id="game-grid">
            {visible.map((game) => (
              <GameCard key={game.id} game={game} onRemove={removeGame} />
            ))}
          </ul>
        ))}
      </main>

      <dialog
        ref={dialogRef}
        className="modal"
        aria-labelledby="game-modal-title"
        onClick={handleBackdrop}
        onClose={handleDialogClose}
      >
        <GameForm
          form={form}
          setForm={setForm}
          formValid={formValid}
          titleRef={titleRef}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </dialog>
    </div>
  );
}

export default App;
