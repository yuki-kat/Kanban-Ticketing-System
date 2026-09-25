# Agent Instructions

## Project Shape

- This is a Vite + React 18 single-page IT service desk kanban board.
- `src/App.jsx` owns the ticket fixtures, ticket state, four status columns, status transitions, SLA countdowns, and local persistence. `SlaTimer` is the only extracted component.
- `src/main.jsx` mounts `App` under `React.StrictMode` and imports the global stylesheet.
- `src/styles.css` contains all styling. Use the existing kebab-case class naming and preserve the responsive grid breakpoints unless the UI requirement changes.
- There is no backend, routing layer, authentication, test suite, lint configuration, or type system currently in the repository.

## Data And Behavior

- Tickets are loaded from `localStorage` key `it_desk_tickets_v3`, falling back to `initialTickets` in `src/App.jsx`; updates are serialized back through a React effect.
- Persistence is browser-local and per-origin. Do not imply multi-user synchronization or database behavior without adding that explicitly.
- Status values are the exact strings `New`, `In Progress`, `Escalated`, and `Resolved`; priorities are `P1` through `P4`. Update the column definitions, selectors, counts, and SLA logic together when changing these values.
- SLA timing is derived from each ticket's `createdAt` and priority. Unresolved tickets receive an interval; resolved tickets display `SLA Met`.
- The `@supabase/*` dependencies are present but unused. Do not introduce Supabase behavior or configuration unless the task specifically requests backend integration.

## Commands

- `npm run dev` starts Vite on port 3000.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the production bundle on port 4173.
- There are no repository test, lint, or typecheck scripts. For UI changes, run `npm run build` at minimum and manually verify the affected interaction in the dev server when practical.

## Change Guidance

- Keep changes close to the owning file: behavior and state in `src/App.jsx`, presentation in `src/styles.css`, document metadata in `index.html`.
- Validate parsed localStorage data before relying on it if changing initialization; malformed or non-array JSON can otherwise break rendering.
- Preserve accessible native controls and clear status labels when changing the board UI.
- Avoid editing generated `dist/` output; regenerate it with the build command instead.
