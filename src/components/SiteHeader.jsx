import { Link, NavLink } from 'react-router-dom';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-brand" to="/">
        <span className="brand-mark">B</span>
        <span>Mira<span className="brand-accent">♡</span></span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <NavLink to="/" end>Chat with Mira</NavLink>
      </nav>
    </header>
  );
}
