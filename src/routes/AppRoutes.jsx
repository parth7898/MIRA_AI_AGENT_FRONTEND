import { Navigate, Route, Routes } from 'react-router-dom';
import ChatbotPage from '../pages/ChatbotPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ChatbotPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
