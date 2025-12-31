import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Activities.css';

const Activities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date_time: '',
    performed_by_id: user.id,
    status: 'pending',
    photo: null
  });
  const [filters, setFilters] = useState({
    status: '',
    performed_by: '',
    start_date: '',
    end_date: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchActivities();
    if (user.role !== 'Farmer') {
      fetchUsers();
    }
  }, [filters]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/api/activities?${params.toString()}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
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
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'photo' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (formData.photo) {
      formDataToSend.append('photo', formData.photo);
    }

    try {
      if (editingActivity) {
        await axios.put(`/api/activities/${editingActivity.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/activities', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      setEditingActivity(null);
      setFormData({
        name: '',
        description: '',
        date_time: '',
        performed_by_id: user.id,
        status: 'pending',
        photo: null
      });
      fetchActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Error saving activity: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    // Convert date_time to format required by datetime-local input (YYYY-MM-DDTHH:mm)
    const dateTimeValue = activity.date_time 
      ? new Date(activity.date_time).toISOString().slice(0, 16)
      : '';
    setFormData({
      name: activity.name,
      description: activity.description || '',
      date_time: dateTimeValue,
      performed_by_id: activity.performed_by_id,
      status: activity.status,
      photo: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    try {
      await axios.delete(`/api/activities/${id}`);
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Error deleting activity');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Activities</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Activity
        </button>
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
            value={filters.performed_by}
            onChange={(e) => setFilters({ ...filters, performed_by: e.target.value })}
          >
            <option value="">All Farmers</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        )}
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          placeholder="End Date"
        />
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Performed By</th>
              <th>Date/Time</th>
              <th>Status</th>
              <th>Photo</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.name}</td>
                <td>{activity.description || 'N/A'}</td>
                <td>{activity.performed_by_name}</td>
                <td>{new Date(activity.date_time).toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${activity.status.replace('-', '-')}`}>
                    {activity.status}
                  </span>
                </td>
                <td>
                  {activity.photo_url ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${activity.photo_url}`} 
                      alt="Activity" 
                      className="activity-photo-thumb"
                    />
                  ) : 'N/A'}
                </td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleEdit(activity)}
                    style={{ marginRight: '5px' }}
                  >
                    Edit
                  </button>
                  {(user.role === 'Owner' || user.role === 'Manager') && (
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(activity.id)}
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
              <h2>{editingActivity ? 'Edit Activity' : 'Add Activity'}</h2>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setEditingActivity(null);
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Activity Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <div className="form-group">
                <label>Date/Time *</label>
                <input
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                  required
                />
              </div>
              {user.role !== 'Farmer' && (
                <div className="form-group">
                  <label>Performed By</label>
                  <select
                    value={formData.performed_by_id}
                    onChange={(e) => setFormData({ ...formData, performed_by_id: e.target.value })}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
              )}
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
              <div className="form-group">
                <label>Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                />
                {formData.photo && (
                  <img 
                    src={URL.createObjectURL(formData.photo)} 
                    alt="Preview" 
                    className="photo-preview"
                  />
                )}
              </div>
              <button type="submit" className="btn btn-primary">
                {editingActivity ? 'Update' : 'Create'} Activity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;

