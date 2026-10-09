const TABS = [
  { id: 'quest', label: 'Quest' },
  { id: 'status', label: 'Status' },
  { id: 'settings', label: 'Settings' }
];

/** The bottom bar. Three tabs only: a 4th one is the bloat warning. */
export function TabBar({ tab, setTab, alert }) {
  return (
    <nav class="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button key={t.id} class={`tab px ${tab === t.id ? 'on' : ''}`} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
          {tab === t.id && <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2 L12 7 L2 12 Z" fill="currentColor" /></svg>}
          {t.label}
          {t.id === 'quest' && alert && <span class="tab-dot" aria-label="Quest waiting" />}
        </button>
      ))}
    </nav>
  );
}
