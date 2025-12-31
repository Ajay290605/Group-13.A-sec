import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Users.css';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Farmer',
    owner_id: user.role === 'Owner' ? user.id : null,
    manager_id: user.role === 'Manager' ? user.id : null
  });
  const [owners, setOwners] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchUsers();
    if (user.role === 'Owner') {
      fetchManagers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/api/users/role/manager');
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', formData);
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'Farmer',
        owner_id: user.role === 'Owner' ? user.id : null,
        manager_id: user.role === 'Manager' ? user.id : null
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge role-${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add User</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setFormData({
                      ...formData,
                      role: newRole,
                      owner_id: newRole === 'Manager' ? user.id : (newRole === 'Farmer' ? null : user.id),
                      manager_id: newRole === 'Farmer' ? user.id : null
                    });
                  }}
                  required
                >
                  {user.role === 'Owner' && <option value="Manager">Manager</option>}
                  {(user.role === 'Owner' || user.role === 'Manager') && <option value="Farmer">Farmer</option>}
                </select>
              </div>
              {formData.role === 'Manager' && user.role === 'Owner' && (
                <div className="form-group">
                  <label>Owner</label>
                  <input type="text" value={user.username} disabled />
                </div>
              )}
              {formData.role === 'Farmer' && user.role === 'Owner' && (
                <div className="form-group">
                  <label>Manager *</label>
                  <select
                    value={formData.manager_id || ''}
                    onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                    required
                  >
                    <option value="">Select Manager</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.username}</option>
                    ))}
                  </select>
                </div>
              )}
              <button type="submit" className="btn btn-primary">
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;







