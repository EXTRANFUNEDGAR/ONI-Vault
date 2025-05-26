import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';

export default function FolderView() {
  const { id } = useParams();
  const [media, setMedia] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState('all');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const [mediaRes, folderRes] = await Promise.all([
        axios.get('/media'),
        axios.get('/folders'),
      ]);
      const filtered = mediaRes.data.filter((file) => file.folder_id === parseInt(id));
      const folder = folderRes.data.find((f) => f.id === parseInt(id));
      setMedia(filtered);
      setFolderName(folder?.name || '');
    };
    fetchData();
  }, [id]);

  const handleFilesUpload = async (selectedFiles) => {
    const formData = new FormData();
    for (const file of selectedFiles) {
      formData.append('files', file);
    }
    formData.append('folder_id', id);

    try {
      setUploading(true);
      setProgress(0);
      await axios.post(`/media/multi-upload?folder_id=${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });
      location.reload();
    } catch (err) {
      console.error('Error exacto:', err.response?.data || err.message);
      alert('Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFilesUpload(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    handleFilesUpload(e.target.files);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredMedia.map((f) => f.id);
    const allSelected = visibleIds.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return;
    if (!confirm('¿Seguro que deseas eliminar los archivos seleccionados?')) return;
    try {
      await axios.delete('/media/bulk', {
        data: { ids: selected },
        headers: { 'Content-Type': 'application/json' },
      });
      location.reload();
    } catch (err) {
      console.error('Error al eliminar:', err.response?.data || err.message);
      alert('Error al eliminar archivos');
    }
  };

  const filteredMedia =
    filter === 'all' ? media : media.filter((file) => file.type === filter);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-white">Carpeta: {folderName}</h2>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select bg-dark text-light border-secondary"
          >
            <option value="all">Todos</option>
            <option value="image">Imágenes</option>
            <option value="video">Videos</option>
          </select>
          <button onClick={toggleSelectAll} className="btn btn-outline-light btn-sm">
            {selected.length === filteredMedia.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
          {selected.length > 0 && (
            <button onClick={deleteSelected} className="btn btn-danger btn-sm">
              Eliminar ({selected.length})
            </button>
          )}
          <Link to="/" className="text-info small">← Volver a carpetas</Link>
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current.click()}
        className="p-4 mb-4 border border-info text-center rounded bg-oni cursor-pointer"
      >
        <p>{uploading ? 'Subiendo archivos...' : 'Arrastra o haz clic para subir archivos'}</p>
        {uploading && (
          <div className="progress mt-2">
            <div className="progress-bar progress-bar-striped bg-info" style={{ width: `${progress}%` }}></div>
          </div>
        )}
        <input type="file" multiple hidden ref={fileInputRef} onChange={handleInputChange} />
      </div>

      {filteredMedia.length === 0 ? (
        <p className="text-muted">No hay archivos que coincidan con el filtro.</p>
      ) : (
        <div className="row g-3">
          {filteredMedia.map((file) => (
            <div key={file.id} className="col-6 col-sm-4 col-md-3">
              <div className={`card-oni ${selected.includes(file.id) ? 'border-info' : ''}`}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <input
                    type="checkbox"
                    checked={selected.includes(file.id)}
                    onChange={() => toggleSelect(file.id)}
                    className="form-check-input"
                  />
                  <Link to={`/media/${file.id}`} className="text-info small">
                    Detalles →
                  </Link>
                </div>
                {file.type === 'image' ? (
                  <img
                    src={`http://localhost:5000${file.file_url}`}
                    alt={file.description}
                    className="img-fluid rounded"
                  />
                ) : (
                  <video
                    controls
                    src={`http://localhost:5000${file.file_url}`}
                    className="img-fluid rounded"
                  />
                )}
                <p className="text-light small mt-1">{file.description}</p>
                {file.tags && file.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {file.tags.map((tag, index) => (
                      <span key={index} className="badge bg-secondary">#{tag}</span>
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
}
