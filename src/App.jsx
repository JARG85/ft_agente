import { useEffect, useState } from "react";
import TicketForm from "./components/TicketForm";
import ResultCard from "./components/ResultCard";
import History from "./components/History";
import { checkHealth, submitTicket, ApiError, API_BASE_URL } from "./api";
import { EXAMPLES } from "./examples";
import "./App.css";

const EMPTY_TICKET = { subject: "", body: "", user_tier: "free" };
const VALID_TEMPLATES = EXAMPLES.map((e) => e.ticket);
// Las 4 llaves que agent/pipeline.py::_validate_schema exige en el JSON de
// entrada. Omitir cualquiera de ellas dispara el 400 Bad Request.
const REQUIRED_API_FIELDS = ["ticket_id", "subject", "body", "user_tier"];

let nextId = 1;

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function App() {
  const [ticket, setTicket] = useState(EMPTY_TICKET);
  const [backendUp, setBackendUp] = useState(null); // null = checking
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const ok = await checkHealth();
      if (!cancelled) setBackendUp(ok);
    }
    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const active = history.find((h) => h.id === activeId);
  const resultState = active
    ? { status: active.status, data: active.data, message: active.message, note: active.note }
    : { status: "idle" };
  const submitting = resultState.status === "loading";

  // Hace el POST, crea la fila de historial y la va actualizando cuando
  // llega la respuesta (o el error). `buildPayload(id)` recibe el id ya
  // asignado para poder usarlo como ticket_id.
  async function runSubmission(ticketForDisplay, buildPayload, note) {
    const id = nextId++;
    const time = new Date().toLocaleTimeString("es-CO", { hour12: false });
    const entry = { id, ticket: ticketForDisplay, status: "loading", time, note };
    setHistory((h) => [entry, ...h]);
    setActiveId(id);

    try {
      const data = await submitTicket(buildPayload(id));
      setHistory((h) =>
        h.map((item) => (item.id === id ? { ...item, status: "success", data } : item))
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error inesperado";
      setHistory((h) =>
        h.map((item) => (item.id === id ? { ...item, status: "error", message } : item))
      );
    }
  }

  function handleSubmit() {
    runSubmission(ticket, (id) => ({ ticket_id: `web-${id}`, ...ticket }), null);
  }

  // Genera un ticket al azar: 50% válido (respeta el contrato de la API,
  // pase o no las compuertas de negocio) y 50% inválido (le falta una de
  // las 4 llaves que exige el contrato -> 400 Bad Request).
  function handleGenerateRandom() {
    const template = randomFrom(VALID_TEMPLATES);
    setTicket(template);
    const isValid = Math.random() < 0.5;

    if (isValid) {
      runSubmission(
        template,
        (id) => ({ ticket_id: `web-${id}`, ...template }),
        "Autogenerado: ticket VÁLIDO (cumple el contrato)"
      );
      return;
    }

    const missingField = randomFrom(REQUIRED_API_FIELDS);
    runSubmission(
      template,
      (id) => {
        const payload = { ticket_id: `web-${id}`, ...template };
        delete payload[missingField];
        return payload;
      },
      `Autogenerado: ticket INVÁLIDO (falta "${missingField}")`
    );
  }

  return (
    <div className="page">
      <header className="app-header">
        <div className="eyebrow">Agente de Triage L1 · Consola de prueba</div>
        <div className="title-row">
          <h1>Consola de Soporte</h1>
          <span className={`health-pill ${backendUp ? "up" : backendUp === false ? "down" : "checking"}`}>
            <span className="health-dot" />
            {backendUp === null ? "verificando…" : backendUp ? "backend conectado" : "backend no responde"}
          </span>
        </div>
        <p className="subtitle">
          Envía un ticket y mira en vivo cómo el agente decide entre <code>RESOLVE</code> y{" "}
          <code>ESCALATE</code>. Backend en <code className="mono">{API_BASE_URL}</code>.
        </p>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>Nuevo ticket</h2>
          <TicketForm
            ticket={ticket}
            onChange={setTicket}
            onSubmit={handleSubmit}
            onGenerateRandom={handleGenerateRandom}
            submitting={submitting}
          />
        </section>

        <section className="panel">
          <h2>Resultado</h2>
          <ResultCard state={resultState} />
          <History items={history} activeId={activeId} onSelect={setActiveId} />
        </section>
      </main>
    </div>
  );
}
