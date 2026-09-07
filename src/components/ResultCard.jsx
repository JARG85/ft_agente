const REASON_LABELS = {
  ok: "Resuelto con confianza suficiente",
  low_confidence: "Confianza insuficiente (< 0.7)",
  no_kb_match: "Sin artículo de KB relevante",
  input_empty_or_incomprehensible: "Entrada vacía o incomprensible",
  security_alert_prompt_injection: "Intento de prompt injection detectado",
  requires_prod_db_out_of_scope: "Requiere un sistema transaccional (fuera de alcance)",
  technical_error_llm_unavailable: "El LLM falló tras 3 reintentos",
};

function NoteTag({ note }) {
  if (!note) return null;
  return <div className="note-tag">{note}</div>;
}

export default function ResultCard({ state }) {
  if (state.status === "idle") {
    return (
      <div className="result-card result-idle">
        <p>Envía un ticket para ver cómo lo clasifica el agente.</p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="result-card result-loading">
        <span className="spinner" aria-hidden="true" />
        <p>Llamando al agente…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="result-card result-error">
        <NoteTag note={state.note} />
        <div className="result-badge badge-error">ERROR</div>
        <p>{state.message}</p>
      </div>
    );
  }

  const r = state.data;
  const isResolve = r.action === "RESOLVE";

  return (
    <div className={`result-card ${isResolve ? "result-resolve" : "result-escalate"}`}>
      <NoteTag note={state.note} />
      <div className="result-header">
        <span className={`result-badge ${isResolve ? "badge-good" : "badge-warn"}`}>
          {r.action}
        </span>
        <span className="ticket-id mono">{r.ticket_id}</span>
      </div>

      {r.security_alert && (
        <div className="alert-banner">🚩 Alerta de seguridad: posible intento de manipulación</div>
      )}

      <div className="confidence-row">
        <span className="confidence-label">confidence_score</span>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${Math.round((r.confidence_score ?? 0) * 100)}%` }}
          />
        </div>
        <span className="confidence-value mono">{r.confidence_score?.toFixed(2)}</span>
      </div>

      <p className="reason">{REASON_LABELS[r.reason] || r.reason}</p>

      <div className="draft-block">
        <div className="draft-label">draft_response</div>
        <p className="draft-text">{r.draft_response}</p>
      </div>

      {r.kb_citations?.length > 0 && (
        <div className="citations">
          <div className="draft-label">kb_citations</div>
          <ul>
            {r.kb_citations.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
