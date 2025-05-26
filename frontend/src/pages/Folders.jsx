import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await axios.get('/folders');
      setFolders(res.data);
    } catch (err) {
      console.error('Error al obtener carpetas:', err);
    }
  };

  const createFolder = async () => {
    if (!name.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }
    try {
      await axios.post('/folders', { name });
      setName('');
      setError('');
      fetchFolders();
    } catch (err) {
      setError('Error al crear carpeta');
    }
  };

  const deleteFolder = async (id) => {
    const confirmDelete = confirm('¿Eliminar esta carpeta y todos sus archivos?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`/folders/${id}`);
      fetchFolders();
    } catch (err) {
      alert('Error al eliminar carpeta');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tus carpetas</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la nueva carpeta"
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={createFolder}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Crear
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {folders.length === 0 ? (
        <p className="text-gray-600">No hay carpetas aún.</p>
      ) : (
        <ul className="space-y-3">
          {folders.map((folder) => (
            <li
              key={folder.id}
              className="flex justify-between items-center bg-white p-4 rounded shadow"
            >
              <Link
                to={`/folder/${folder.id}`}
                className="text-blue-700 hover:underline font-medium"
              >
                {folder.name}
              </Link>
              <button
                onClick={() => deleteFolder(folder.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
