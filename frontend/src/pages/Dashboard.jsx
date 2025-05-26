import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

function NewFolder({ onCreated }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await axios.post('/folders', { name });
      setMessage('Carpeta creada ✅');
      setName('');
      if (onCreated) onCreated(res.data);
    } catch (err) {
      setMessage('Error al crear carpeta');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="input-group mb-2">
        <input
          type="text"
          placeholder="Nombre de la carpeta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
        />
        <button className="btn btn-oni" type="submit">
          Crear carpeta
        </button>
      </div>
      {message && <div className="form-text text-info">{message}</div>}
    </form>
  );
}

export default function Dashboard() {
  const [folders, setFolders] = useState([]);
  const [media, setMedia] = useState([]);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchData = async () => {
    try {
      const [folderRes, mediaRes] = await Promise.all([
        axios.get('/folders'),
        axios.get('/media')
      ]);
      setFolders(folderRes.data);
      setMedia(mediaRes.data);
    } catch (err) {
      setError('Error al cargar archivos');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return alert('Nada seleccionado');
    if (!confirm('¿Eliminar los archivos seleccionados?')) return;

    try {
      await axios.delete('/media/bulk', { data: { ids: selectedIds } });
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      alert('Error al eliminar');
      console.error(err);
    }
  };

  const getFilesInFolder = (folderId) =>
    media.filter((file) => file.folder_id === folderId);

  const filesWithoutFolder = media.filter((file) => file.folder_id === null);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-oni">ONI Vault</h2>
        <Link to="/upload" className="btn btn-oni">
          + Subir archivo
        </Link>
      </div>

      <NewFolder onCreated={fetchData} />

      {selectedIds.length > 0 && (
        <div className="mb-3">
          <button onClick={deleteSelected} className="btn btn-danger">
            Eliminar seleccionados ({selectedIds.length})
          </button>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {folders.map((folder) => {
        const files = getFilesInFolder(folder.id);
        return (
          <div key={folder.id} className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h4 className="text-light">{folder.name}</h4>
              <Link to={`/folder/${folder.id}`} className="text-info text-decoration-none">
                Ver carpeta →
              </Link>
            </div>

            {files.length === 0 ? (
              <p className="text-muted">Carpeta vacía</p>
            ) : (
              <div className="row g-3">
                {files.map((file) => (
                  <div key={file.id} className="col-6 col-md-4 col-lg-3">
                    <div className="card card-hover p-2">
                      <input
                        type="checkbox"
                        className="form-check-input mb-1"
                        checked={selectedIds.includes(file.id)}
                        onChange={() => toggleSelected(file.id)}
                      />
                      <Link to={`/media/${file.id}`}>
                        {file.type === 'image' ? (
                          <img
                            src={`http://localhost:5000${file.file_url}`}
                            alt={file.description}
                            className="w-100 rounded"
                          />
                        ) : (
                          <video
                            controls
                            src={`http://localhost:5000${file.file_url}`}
                            className="w-100 rounded"
                          />
                        )}
                      </Link>
                      <div className="mt-2 text-white small">{file.description}</div>
                      {file.tags && file.tags.length > 0 && (
                        <div className="d-flex flex-wrap mt-1">
                          {file.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="badge bg-secondary me-1 mb-1"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {filesWithoutFolder.length > 0 && (
        <div>
          <h4 className="text-light mb-2">📂 Sin carpeta</h4>
          <div className="row g-3">
            {filesWithoutFolder.map((file) => (
              <div key={file.id} className="col-6 col-md-4 col-lg-3">
                <div className="card card-hover p-2">
                  <input
                    type="checkbox"
                    className="form-check-input mb-1"
                    checked={selectedIds.includes(file.id)}
                    onChange={() => toggleSelected(file.id)}
                  />
                  <Link to={`/media/${file.id}`}>
                    {file.type === 'image' ? (
                      <img
                        src={`http://localhost:5000${file.file_url}`}
                        alt={file.description}
                        className="w-100 rounded"
                      />
                    ) : (
                      <video
                        controls
                        src={`http://localhost:5000${file.file_url}`}
                        className="w-100 rounded"
                      />
                    )}
                  </Link>
                  <div className="mt-2 text-white small">{file.description}</div>
                  {file.tags && file.tags.length > 0 && (
                    <div className="d-flex flex-wrap mt-1">
                      {file.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="badge bg-secondary me-1 mb-1"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
