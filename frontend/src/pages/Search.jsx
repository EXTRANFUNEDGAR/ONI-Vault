import { useState } from 'react';
import axios from '../api/axios';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`/media/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
      setError('');
    } catch {
      setError('Error al buscar');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Buscar archivos</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Buscar por descripción o etiqueta"
          className="border px-4 py-2 rounded w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {results.length === 0 && query && (
        <p className="text-gray-500">No se encontraron resultados.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {results.map((file) => (
          <div key={file.id} className="bg-white p-2 rounded shadow">
            {file.type === 'image' ? (
              <img
                src={`http://localhost:5000${file.file_url}`}
                alt={file.description}
                className="w-full h-40 object-cover rounded"
              />
            ) : (
              <video
                controls
                src={`http://localhost:5000${file.file_url}`}
                className="w-full h-40 object-cover rounded"
              />
            )}
            <p className="text-sm mt-1 text-gray-700">{file.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
