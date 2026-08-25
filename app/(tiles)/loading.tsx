/**
 * Route-group loading skeleton for the 8 tiles. Renders while any tile
 * page is suspending (e.g. while a server fetch resolves). Per-tile
 * loading states live inside the page itself; this is the route-level
 * fallback so navigation feels instant.
 */
export default function TilesLoading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <span className="skeleton skeleton--title" aria-hidden />
      <span className="skeleton skeleton--text" style={{ width: "80%" }} aria-hidden />
      <span className="skeleton skeleton--text" style={{ width: "60%" }} aria-hidden />
      <div style={{ height: 12 }} />
      <div className="card" aria-hidden>
        <span className="skeleton skeleton--big" />
        <span className="skeleton skeleton--text" style={{ width: "50%" }} />
        <span className="skeleton skeleton--text" style={{ width: "40%" }} />
        <div style={{ height: 8 }} />
        <div className="forecast">
          <div className="day">
            <span className="skeleton skeleton--text" style={{ width: "50%" }} />
            <span className="skeleton skeleton--text" style={{ width: "70%" }} />
          </div>
          <div className="day">
            <span className="skeleton skeleton--text" style={{ width: "50%" }} />
            <span className="skeleton skeleton--text" style={{ width: "70%" }} />
          </div>
          <div className="day">
            <span className="skeleton skeleton--text" style={{ width: "50%" }} />
            <span className="skeleton skeleton--text" style={{ width: "70%" }} />
          </div>
        </div>
      </div>
    </article>
  );
}
