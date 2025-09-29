import React, { useState } from 'react';
import { users } from './users'; // Importa a lista de usuários
import './styles.css'; // Usaremos os estilos existentes

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const userFound = users.find(u => u.username === username && u.password === password);

    if (userFound) {
      onLoginSuccess(userFound);
    } else {
      setError("Usuário ou senha incorretos.");
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Login</h3>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <div className="form-row">
            <label>Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" style={{ width: '100%' }}>Entrar</button>
        </form>
      </div>
      <footer className="footer" style={{ textAlign: 'center', marginTop: '16px' }}>Feito para loja de joias — BrilhoGestor.</footer>
    </div>
  );
}