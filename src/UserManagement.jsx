import React, { useState } from 'react';

export default function UserManagement({ users, setUsers, currentUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [editingUser, setEditingUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      // Logic to edit an existing user
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, username, password, role } : u));
      setEditingUser(null);
    } else {
      // Logic to add a new user
      if (users.find(u => u.username === username)) {
        alert("Nome de usuário já existe.");
        return;
      }
      const newUser = { id: Date.now(), username, password, role };
      setUsers([...users, newUser]);
    }
    setUsername("");
    setPassword("");
    setRole("user");
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(user.password);
    setRole(user.role);
  };

  const handleDelete = (userId) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <section>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{editingUser ? "Editar Usuário" : "Cadastrar Novo Usuário"}</h3>
          <form onSubmit={handleSubmit}>
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
            <div className="form-row">
              <label>Permissão</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">Usuário Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button className="btn" type="submit" style={{ width: '100%' }}>
              {editingUser ? "Salvar Edição" : "Cadastrar Usuário"}
            </button>
            {editingUser && (
              <button className="btn" type="button" onClick={() => { setEditingUser(null); setUsername(""); setPassword(""); setRole("user"); }} style={{ width: '100%', marginTop: '8px' }}>
                Cancelar
              </button>
            )}
          </form>
        </div>
        
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Lista de Usuários</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Permissão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}</td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(user)} style={{ marginRight: '8px' }}>Editar</button>
                    {currentUser.id !== user.id && (
                      <button className="btn-sm" onClick={() => handleDelete(user.id)} style={{ backgroundColor: 'salmon' }}>Excluir</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}