import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import SiteHeader from './components/SiteHeader.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <SiteHeader />
        <AppRoutes />
        <footer className="site-footer">
          <span>© {new Date().getFullYear()} Mira</span>
          <span>A little warmth goes a long way.</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}
