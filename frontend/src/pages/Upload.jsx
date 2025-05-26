import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('image');
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await axios.get('/folders');
        setFolders(res.data);
      } catch {
        setError('No se pudieron cargar las carpetas');
      }
    };
    fetchFolders();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Selecciona un archivo');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('type', type);
    if (folderId) formData.append('folder_id', folderId);

    try {
      await axios.post('/media/upload', formData);
      setSuccess('Archivo subido correctamente');
      setError('');
      setFile(null);
      setDescription('');
      setFolderId('');
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Error al subir archivo');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Subir archivo</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

        <input
          type="file"
          className="w-full mb-3"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <input
          type="text"
          placeholder="Descripción"
          className="w-full mb-3 px-4 py-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full mb-3 px-4 py-2 border rounded"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
        >
          <option value="">Selecciona una carpeta (opcional)</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>

        <select
          className="w-full mb-4 px-4 py-2 border rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="image">Imagen</option>
          <option value="video">Video</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Subir
        </button>
      </form>
    </div>
  );
}
