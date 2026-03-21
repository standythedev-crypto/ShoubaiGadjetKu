import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Sell from './pages/Sell';
import Assistant from './pages/Assistant';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/assistant" element={<Assistant />} />
      </Routes>
    </Router>
  );
}
