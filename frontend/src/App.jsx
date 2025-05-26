import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // si ya lo creaste
import Upload from './pages/Upload';
import Folders from './pages/Folders';
import FolderView from './pages/FolderView';
import Search from './pages/Search';
import MediaDetail from './pages/MediaDetail';









export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/register" element={<Register />} />
        <Route path="/folders" element={<Folders />} />
        <Route path="/folder/:id" element={<FolderView />} />   
        <Route path="/media/:id" element={<MediaDetail />} />
        <Route path="/search" element={<Search />} />   
      </Routes>
    </BrowserRouter>
  );
}
