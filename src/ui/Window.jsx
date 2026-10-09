/** The FF-style menu window every screen is built from. */
export function Window({ children, class: cls = '', label, ...rest }) {
  return (
    <section class={`win ${cls}`} aria-label={label} {...rest}>
      {children}
    </section>
  );
}

/** The white pointer the classic menus use for the selected row. */
export function Cursor() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 2 L12 7 L2 12 Z" fill="currentColor" />
    </svg>
  );
}
