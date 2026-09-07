import { useId } from "react";
import { EXAMPLES } from "../examples";

export default function TicketForm({ ticket, onChange, onSubmit, onGenerateRandom, submitting }) {
  const subjectId = useId();
  const bodyId = useId();
  const tierId = useId();

  function update(field, value) {
    onChange({ ...ticket, [field]: value });
  }

  function loadExample(example) {
    onChange({ ...example.ticket });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor={subjectId}>Asunto</label>
        <input
          id={subjectId}
          type="text"
          value={ticket.subject}
          onChange={(e) => update("subject", e.target.value)}
          placeholder="Ej. No puedo entrar"
        />
      </div>

      <div className="field">
        <label htmlFor={bodyId}>Cuerpo del ticket</label>
        <textarea
          id={bodyId}
          rows={5}
          value={ticket.body}
          onChange={(e) => update("body", e.target.value)}
          placeholder="Describe la solicitud del cliente…"
        />
      </div>

      <div className="field">
        <label htmlFor={tierId}>Nivel del cliente</label>
        <select
          id={tierId}
          value={ticket.user_tier}
          onChange={(e) => update("user_tier", e.target.value)}
        >
          <option value="free">free</option>
          <option value="pro">pro</option>
          <option value="enterprise">enterprise</option>
        </select>
      </div>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Procesando…" : "Enviar ticket al agente"}
      </button>

      <div className="random-generate">
        <button
          type="button"
          className="btn-secondary"
          disabled={submitting}
          onClick={onGenerateRandom}
        >
          🎲 Autogenerar ticket (válido o inválido)
        </button>
        <p className="random-hint">
          50/50: rellena el formulario y lo envía de una vez. "Inválido" le quita al
          request una de las 4 llaves que exige el contrato de la API (dispara 400).
        </p>
      </div>

      <div className="examples">
        <span className="examples-label">Casos de ejemplo</span>
        <div className="examples-chips">
          {EXAMPLES.map((example) => (
            <button
              type="button"
              key={example.label}
              className="chip"
              onClick={() => loadExample(example)}
              title={`Se espera: ${example.expect}`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
