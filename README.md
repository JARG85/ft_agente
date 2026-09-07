# Consola de Triage (frontend)

Interfaz React (Vite) para el agente de soporte en `../agente/`. Envía un
ticket, ve en vivo la clasificación `RESOLVE`/`ESCALATE`, el borrador
redactado por Gemini, las citas de la KB y el nivel de confianza.

## Requisitos

El backend Flask (`../agente/`) debe estar corriendo, con su propio
`.env` configurado (ver `../agente/README.md`).

## Cómo correr

```bash
# 1. Backend (en otra terminal)
cd ../agente
./asistente/bin/python app.py
# -> http://127.0.0.1:5000

# 2. Frontend
npm install
cp .env.example .env   # ajusta VITE_API_BASE_URL si tu backend no está en localhost:5000
npm run dev
# -> http://localhost:5173
```

La consola muestra un indicador ("backend conectado"/"backend no responde")
que hace polling a `GET /health` cada 10s.

## Notas

- El backend habilita CORS solo para `localhost:5173`/`4173` (ver
  `agente/app.py`) — si cambias el puerto del frontend, agrégalo ahí también.
- Los chips de "Casos de ejemplo" (`src/examples.js`) son los mismos
  escenarios que `agente/tests/cases.json`, para poder demostrar rápido los
  distintos caminos del pipeline (ver `../ruta_del_ticket.html`).
- El historial de tickets vive solo en memoria del navegador (se pierde al
  recargar) — es una consola de demo, no un sistema de tickets persistente.
