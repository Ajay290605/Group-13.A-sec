import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Tasks.css';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to_id: '',
    due_date: '',
    status: 'pending'
  });
  const [filters, setFilters] = useState({
    status: '',
    assigned_to: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTasks();
    if (user.role !== 'Farmer') {
      fetchUsers();
    }
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/api/tasks?${params.toString()}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, formData);
      } else {
        await axios.post('/api/tasks', formData);
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        assigned_to_id: '',
        due_date: '',
        status: 'pending'
      });
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        assigned_to_id: task.assigned_to_id,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        status: task.status
      });
    setShowModal(true);
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Tasks</h1>
        {(user.role === 'Owner' || user.role === 'Manager') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Assign Task
          </button>
        )}
      </div>

      <div className="filter-bar">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {user.role !== 'Farmer' && (
          <select
            value={filters.assigned_to}
            onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
          >
            <option value="">All Users</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        )}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Assigned By</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description || 'N/A'}</td>
                <td>{task.assigned_by_name}</td>
                <td>{task.assigned_to_name}</td>
                <td>
                  {user.role === 'Farmer' && task.assigned_to_id === user.id ? (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className={`status-badge status-${task.status.replace('-', '-')}`}>
                      {task.status}
                    </span>
                  )}
                </td>
                <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleEdit(task)}
                    style={{ marginRight: '5px' }}
                  >
                    Edit
                  </button>
                  {(user.role === 'Owner' || user.role === 'Manager') && (
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Assign Task'}</h2>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setEditingTask(null);
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              {!editingTask && (user.role === 'Owner' || user.role === 'Manager') && (
                <div className="form-group">
                  <label>Assign To *</label>
                  <select
                    value={formData.assigned_to_id}
                    onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                    required
                  >
                    <option value="">Select Farmer</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              {editingTask && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              <button type="submit" className="btn btn-primary">
                {editingTask ? 'Update' : 'Assign'} Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;

