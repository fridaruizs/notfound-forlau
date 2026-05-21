export default function Footer() {
  return (
    <>
      <style>{`
        .xp-footer {
          background: var(--xp-header-bg);
          border-top: 2px solid var(--xp-border-light);
          padding: 6px 12px;
          font-size: 11px;
          color: var(--xp-highlight-text);
          text-align: center;
          text-shadow: 1px 1px 0 #000;
          letter-spacing: 0.3px;
        }
        .xp-footer a {
          color: #a8d4ff;
          text-decoration: none;
        }
        .xp-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
      <footer className="xp-footer">
        © 2026 made with ❤︎ by{" "}
        <a href="https://github.com/fridaruizs" target="_blank" rel="noopener noreferrer">
          frida ruiz
        </a>
      </footer>
    </>
  );
}