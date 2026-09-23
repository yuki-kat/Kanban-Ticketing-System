import { useEffect, useState } from 'react';

const SLA_TARGETS_MINUTES = { P1: 15, P2: 120, P3: 480, P4: 1440 };

const initialTickets = [
  {
    id: 'INC-1001',
    title: 'VPN Access Failure',
    category: 'Network',
    priority: 'P2',
    assignee: 'Alex Chen',
    status: 'New',
    escalationTier: 'L1',
    createdAt: Date.now() - 1800000,
    description: 'Timeout errors on primary VPN gateway.',
  },
  {
    id: 'INC-1002',
    title: 'Database Spike - High CPU',
    category: 'Infrastructure',
    priority: 'P1',
    assignee: 'Sarah Jenkins',
    status: 'In Progress',
    escalationTier: 'L3',
    createdAt: Date.now() - 600000,
    description: 'Production DB CPU at 98%.',
  },
];

const columns = [
  { id: 'New', label: 'New / Triage', colorClass: 'column-blue' },
  { id: 'In Progress', label: 'In Progress', colorClass: 'column-yellow' },
  { id: 'Escalated', label: 'Escalated', colorClass: 'column-red' },
  { id: 'Resolved', label: 'Resolved / Closed', colorClass: 'column-green' },
];

function formatDuration(ms) {
  const abs = Math.abs(ms);
  const hours = Math.floor(abs / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
}

function SlaTimer({ createdAt, priority, status }) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (status === 'Resolved') return undefined;

    const interval = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  if (status === 'Resolved') {
    return <span className="sla-badge sla-good">SLA Met</span>;
  }

  const limit = (SLA_TARGETS_MINUTES[priority] || 480) * 60000;
  const diff = createdAt + limit - currentTime;
  const isBreached = diff <= 0;

  return (
    <span className={`sla-badge ${isBreached ? 'sla-bad' : 'sla-normal'}`}>
      {isBreached ? `BREACH: -${formatDuration(diff)}` : `SLA: ${formatDuration(diff)}`}
    </span>
  );
}

export default function App() {
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = window.localStorage.getItem('it_desk_tickets_v3');
      return saved ? JSON.parse(saved) : initialTickets;
    } catch {
      return initialTickets;
    }
  });

  useEffect(() => {
    window.localStorage.setItem('it_desk_tickets_v3', JSON.stringify(tickets));
  }, [tickets]);

  const handleMove = (id, newStatus) => {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status: newStatus } : ticket,
      ),
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Operations board</p>
          <h1>IT Service Desk Board</h1>
        </div>
        <div className="chip-row">
          <span className="chip chip-blue">{tickets.filter((t) => t.status === 'New').length} New</span>
          <span className="chip chip-yellow">{tickets.filter((t) => t.status === 'In Progress').length} Active</span>
          <span className="chip chip-red">{tickets.filter((t) => t.status === 'Escalated').length} Escalated</span>
        </div>
      </header>

      <main className="board-grid">
        {columns.map((column) => (
          <section key={column.id} className={`board-column ${column.colorClass}`}>
            <div className="column-header">
              <h2>{column.label}</h2>
              <span>{tickets.filter((ticket) => ticket.status === column.id).length}</span>
            </div>

            {tickets.filter((ticket) => ticket.status === column.id).map((ticket) => (
              <article key={ticket.id} className="ticket-card">
                <div className="ticket-topline">
                  <span className="ticket-id">{ticket.id}</span>
                  <span className="priority-badge">{ticket.priority}</span>
                </div>

                <h3>{ticket.title}</h3>
                <p className="ticket-meta">{ticket.category} • {ticket.assignee}</p>

                <SlaTimer
                  createdAt={ticket.createdAt}
                  priority={ticket.priority}
                  status={ticket.status}
                />

                <p className="ticket-description">{ticket.description}</p>

                <label className="status-picker">
                  <span>Status</span>
                  <select
                    value={ticket.status}
                    onChange={(event) => handleMove(ticket.id, event.target.value)}
                  >
                    {columns.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
