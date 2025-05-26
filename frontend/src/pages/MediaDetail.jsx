import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function MediaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const [fileRes, folderRes] = await Promise.all([
          axios.get(`/media/${id}`),
          axios.get('/folders')
        ]);
        setFile(fileRes.data);
        setFolders(folderRes.data);
        setDescription(fileRes.data.description || '');
        setTags(fileRes.data.tags ? fileRes.data.tags.join(', ') : '');
        setFolderId(fileRes.data.folder_id || '');
      } catch {
        setError('Archivo no encontrado');
      }
    };
    fetchFile();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await axios.put(`/media/${id}`, {
        description,
        tags: tagArray,
        folder_id: folderId || null
      });
      setMessage('✅ Archivo actualizado correctamente');
      setError('');
    } catch {
      setMessage('');
      setError('❌ Error al actualizar');
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este archivo permanentemente?')) return;
    try {
      await axios.delete(`/media/${id}`);
      navigate('/');
    } catch {
      setError('❌ Error al eliminar');
    }
  };

  if (!file) {
    return <div className="container py-5 text-secondary">Cargando archivo...</div>;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-light">📁 Detalles del archivo</h1>
        {file.folder_id && (
          <Link to={`/folder/${file.folder_id}`} className="btn btn-outline-light btn-sm">
            ← Volver a carpeta
          </Link>
        )}
      </div>

      <div className="mb-4 border rounded bg-dark p-3 text-center">
        {file.type === 'image' ? (
          <img
            src={`http://localhost:5000${file.file_url}`}
            alt={file.description}
            className="img-fluid rounded"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        ) : (
          <video
            controls
            src={`http://localhost:5000${file.file_url}`}
            className="img-fluid rounded"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        )}
      </div>

      <form onSubmit={handleUpdate} className="bg-dark p-4 rounded shadow">
        <div className="mb-3">
          <label className="form-label text-light">📝 Descripción</label>
          <input
            type="text"
            className="form-control bg-secondary text-white border-0"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-light">📂 Carpeta</label>
          <select
            className="form-select bg-secondary text-white border-0"
            value={folderId || ''}
            onChange={(e) => setFolderId(e.target.value)}
          >
            <option value="">Sin carpeta</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label text-light">🏷️ Etiquetas (separadas por comas)</label>
          <input
            type="text"
            className="form-control bg-secondary text-white border-0"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="d-flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">
            💾 Guardar cambios
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            🗑️ Eliminar archivo
          </button>
        </div>
      </form>
    </div>
  );
}
