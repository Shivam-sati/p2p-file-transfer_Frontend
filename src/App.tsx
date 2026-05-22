import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Download from './pages/Download';
import { Navbar } from './components/common/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#09090b]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/download/:code" element={<Download />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

