import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await axios.post('/auth/register', { email, password });
      navigate('/login');
    } catch (err) {
      setMsg('Error al registrar usuario');
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-dark text-light">
      <div className="card bg-secondary p-4" style={{ width: '100%', maxWidth: 400 }}>
        <h3 className="mb-3 text-center">Registrarse</h3>
        {msg && <div className="alert alert-danger">{msg}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100">Crear cuenta</button>
        </form>
      </div>
    </div>
  );
}
