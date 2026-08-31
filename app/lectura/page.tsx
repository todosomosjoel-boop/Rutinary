'use client';

import { FormEvent, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import { currentUser, readJson, todayKey, writeJson } from '@/lib/storage';

type Reading = {
  id: string;
  title: string;
  type: string;
  totalPages: number;
  currentPage: number;
  completed: boolean;
  completedAt?: string;
  createdAt?: string;
};

type ReadingNote = { id: string; date: string; time?: string; page: number; text: string };

export default function ReadingPage() {
  return <AuthGuard userOnly><AppShell><ReadingPanel /></AppShell></AuthGuard>;
}

function ReadingPanel() {
  const user = currentUser()!;
  const key = `ritmo_readings_${user.username}`;
  const [readings, setReadings] = useState<Reading[]>(() => readJson(key, []));
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Libro');
  const [pages, setPages] = useState('');
  const [selected, setSelected] = useState<string | null>(() => readings.find(item => !item.completed)?.id || readings[0]?.id || null);
  const [current, setCurrent] = useState('');
  const [summary, setSummary] = useState('');
  const [refreshNotes, setRefreshNotes] = useState(0);
  const book = readings.find(item => item.id === selected);
  const activeBooks = readings.filter(item => !item.completed);
  const completedBooks = readings.filter(item => item.completed);

  const notes = useMemo(() => book ? loadBookNotes(user.username, book.id) : [], [book, user.username, refreshNotes]);

  function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !pages || Number(pages) <= 0) return;
    const item: Reading = {
      id: crypto.randomUUID(),
      title: title.trim(),
      type,
      totalPages: Number(pages),
      currentPage: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...readings];
    setReadings(next);
    writeJson(key, next);
    setSelected(item.id);
    setTitle('');
    setPages('');
  }

  function saveProgress() {
    if (!book || current === '') return;
    const requested = Number(current);
    if (!Number.isFinite(requested) || requested < book.currentPage) return;

    const nextPage = Math.min(requested, book.totalPages);
    const addedPages = Math.max(0, nextPage - book.currentPage);
    const logKey = `ritmo_readlog_${user.username}_${book.id}_${todayKey()}`;
    const previous = readJson<any>(logKey, { pages: 0, page: book.currentPage, summary: '', date: todayKey() });
    const completed = nextPage >= book.totalPages;
    const next = readings.map(item => item.id === book.id
      ? { ...item, currentPage: nextPage, completed, completedAt: completed ? item.completedAt || new Date().toISOString() : undefined }
      : item);

    setReadings(next);
    writeJson(key, next);
    writeJson(logKey, {
      pages: Number(previous.pages || 0) + addedPages,
      page: nextPage,
      summary: summary.trim() || previous.summary || '',
      date: todayKey(),
    });

    if (summary.trim()) appendBookNote(user.username, book.id, nextPage, summary.trim());
    setRefreshNotes(value => value + 1);
    setSummary('');
    setCurrent('');
  }

  function addStandaloneNote() {
    if (!book || !summary.trim()) return;
    appendBookNote(user.username, book.id, book.currentPage, summary.trim());
    setRefreshNotes(value => value + 1);
    setSummary('');
  }

  return (
    <>
      <PageHeader
        eyebrow="LECTURA"
        title="Tu biblioteca personal"
        text="Registra el avance de cada lectura y conserva tus anotaciones separadas por libro para consultarlas cuando quieras."
      />

      <div className="reading-layout">
        <section className="card reading-library-card">
          <h2>Agregar lectura</h2>
          <form className="compact-form" onSubmit={add}>
            <input placeholder="Título de la lectura" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="split">
              <select value={type} onChange={e => setType(e.target.value)}><option>Libro</option><option>Revista</option><option>PDF</option><option>Artículo</option><option>Otro</option></select>
              <input type="number" min="1" placeholder="Páginas" value={pages} onChange={e => setPages(e.target.value)} />
            </div>
            <button className="primary">+ Agregar lectura</button>
          </form>

          <div className="library-section-title"><div><span>📖</span><b>En lectura</b></div><span className="pill">{activeBooks.length}</span></div>
          <div className="book-list">
            {activeBooks.length === 0 && <div className="empty">No tienes lecturas activas.</div>}
            {activeBooks.map(item => <BookButton key={item.id} book={item} selected={selected === item.id} onClick={() => setSelected(item.id)} />)}
          </div>

          <div className="library-section-title completed-title"><div><span>✅</span><b>Biblioteca · Leídos</b></div><span className="pill">{completedBooks.length}</span></div>
          <div className="book-list completed-book-list">
            {completedBooks.length === 0 && <div className="empty">Los libros completados aparecerán aquí.</div>}
            {completedBooks.map(item => <BookButton key={item.id} book={item} selected={selected === item.id} onClick={() => setSelected(item.id)} />)}
          </div>
        </section>

        <section className="card reading-detail-card">
          {book ? (
            <>
              <div className="row-between reading-title-row">
                <div><span className="pill">{book.completed ? 'LECTURA COMPLETADA' : 'LECTURA ACTIVA'}</span><h2>{book.title}</h2><small className="muted">{book.type}</small></div>
                {book.completed && <div className="completed-seal">✓<small>Leído</small></div>}
              </div>

              <div className="reading-big"><b>{Math.round(book.currentPage / book.totalPages * 100)}%</b><span>{book.currentPage} de {book.totalPages} páginas</span></div>
              <ProgressBar value={book.currentPage / book.totalPages * 100} />

              {!book.completed ? (
                <div className="reading-entry-form">
                  <label>¿Hasta qué página llegaste hoy?
                    <input type="number" min={book.currentPage} max={book.totalPages} value={current} onChange={e => setCurrent(e.target.value)} placeholder={`Mínimo ${book.currentPage}`} />
                  </label>
                  <label>Anotación o apunte de hoy <span className="optional">opcional</span>
                    <textarea maxLength={500} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Una idea, frase, reflexión o resumen de lo que leíste…" />
                    <small className="counter">{summary.length}/500</small>
                  </label>
                  <button className="primary full" onClick={saveProgress}>Guardar avance de hoy</button>
                </div>
              ) : (
                <div className="completed-reading-message">🎉 Lectura completada. Tu progreso y todas sus anotaciones quedan guardados en esta biblioteca.</div>
              )}

              <section className="notes-history">
                <div className="row-between section-heading">
                  <div><h3>Historial de anotaciones</h3><p>Solo se muestran los apuntes asociados a <b>{book.title}</b>.</p></div>
                  <span className="pill">{notes.length} APUNTES</span>
                </div>

                {book.completed && (
                  <div className="quick-note-box">
                    <label>Agregar una anotación posterior
                      <textarea maxLength={500} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Puedes seguir agregando ideas para recordar este libro…" />
                      <small className="counter">{summary.length}/500</small>
                    </label>
                    <button className="ghost" disabled={!summary.trim()} onClick={addStandaloneNote}>Guardar anotación</button>
                  </div>
                )}

                <div className="notes-list">
                  {notes.length === 0 && <div className="empty">Todavía no hay anotaciones guardadas para este libro.</div>}
                  {notes.map(note => (
                    <article key={note.id} className="note-item">
                      <div className="note-meta"><span>📝 Página {note.page}</span><time>{formatNoteDate(note.date, note.time)}</time></div>
                      <p>{note.text}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : <div className="empty tall">Selecciona o agrega una lectura para comenzar.</div>}
        </section>
      </div>
    </>
  );
}

function BookButton({ book, selected, onClick }: { book: Reading; selected: boolean; onClick: () => void }) {
  const pct = Math.round(book.currentPage / book.totalPages * 100);
  return (
    <button onClick={onClick} className={`book-item ${selected ? 'selected' : ''} ${book.completed ? 'completed' : ''}`}>
      <div className="book-cover">{book.completed ? '✅' : '📖'}</div>
      <div><b>{book.title}</b><span>{book.currentPage} / {book.totalPages} páginas</span><ProgressBar value={pct} /></div>
      <strong>{pct}%</strong>
    </button>
  );
}

function noteKey(username: string, bookId: string) {
  return `ritmo_readnotes_${username}_${bookId}`;
}

function appendBookNote(username: string, bookId: string, page: number, text: string) {
  const key = noteKey(username, bookId);
  const notes = readJson<ReadingNote[]>(key, []);
  const now = new Date();
  const note: ReadingNote = {
    id: crypto.randomUUID(),
    date: todayKey(),
    time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    page,
    text,
  };
  writeJson(key, [note, ...notes]);
}

function loadBookNotes(username: string, bookId: string): ReadingNote[] {
  const saved = readJson<ReadingNote[]>(noteKey(username, bookId), []);
  if (typeof window === 'undefined') return saved;

  const legacy: ReadingNote[] = [];
  const prefix = `ritmo_readlog_${username}_${bookId}_`;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;
    const log = readJson<any>(key, null);
    if (!log?.summary) continue;
    legacy.push({
      id: `legacy-${key}`,
      date: log.date || key.slice(prefix.length),
      page: Number(log.page || 0),
      text: String(log.summary),
    });
  }

  const texts = new Set(saved.map(item => `${item.date}|${item.page}|${item.text}`));
  const merged = [...saved, ...legacy.filter(item => !texts.has(`${item.date}|${item.page}|${item.text}`))];
  return merged.sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
}

function formatNoteDate(date: string, time?: string) {
  const parsed = new Date(`${date}T12:00:00`);
  const label = Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
  return time ? `${label} · ${time}` : label;
}
