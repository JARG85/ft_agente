export default function History({ items, activeId, onSelect }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="history">
      <div className="history-label">Historial de esta sesión</div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`history-row ${item.id === activeId ? "active" : ""}`}
              onClick={() => onSelect(item.id)}
            >
              <span
                className={`history-dot ${
                  item.status === "error"
                    ? "dot-error"
                    : item.data?.action === "RESOLVE"
                    ? "dot-good"
                    : "dot-warn"
                }`}
              />
              <span className="history-subject">
                {item.ticket.subject || <em>(sin asunto)</em>}
              </span>
              <span className="history-time mono">{item.time}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
