import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="container">Error loading dashboard</div>;
  }

  const renderOwnerDashboard = () => (
    <div>
      <h1>Owner Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{dashboardData.managersCount}</h3>
          <p>Managers</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.farmersCount}</h3>
          <p>Farmers</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.activities.total}</h3>
          <p>Total Activities</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.tasks.total}</h3>
          <p>Total Tasks</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Activity Status</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{dashboardData.activities.pending}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-card">
            <h3>{dashboardData.activities.in_progress}</h3>
            <p>In Progress</p>
          </div>
          <div className="stat-card">
            <h3>{dashboardData.activities.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Activities</h2>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Performed By</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.name}</td>
                  <td>{activity.performed_by_name}</td>
                  <td>{new Date(activity.date_time).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${activity.status.replace('-', '-')}`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderManagerDashboard = () => (
    <div>
      <h1>Manager Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{dashboardData.farmersCount}</h3>
          <p>Assigned Farmers</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.tasks.total}</h3>
          <p>Total Tasks</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.tasks.pending}</h3>
          <p>Pending Tasks</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.tasks.completed}</h3>
          <p>Completed Tasks</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Assigned Tasks</h2>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.tasksList.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.assigned_to_name}</td>
                  <td>
                    <span className={`status-badge status-${task.status.replace('-', '-')}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Farmer Activities</h2>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Performed By</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.farmerActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.name}</td>
                  <td>{activity.performed_by_name}</td>
                  <td>{new Date(activity.date_time).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${activity.status.replace('-', '-')}`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFarmerDashboard = () => (
    <div>
      <h1>Farmer Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{dashboardData.taskStats.total}</h3>
          <p>Assigned Tasks</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.taskStats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.taskStats.in_progress}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardData.taskStats.completed}</h3>
          <p>Completed</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Tasks</h2>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned By</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.assignedTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.assigned_by_name}</td>
                  <td>
                    <span className={`status-badge status-${task.status.replace('-', '-')}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Activity History</h2>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.activityHistory.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.name}</td>
                  <td>{new Date(activity.date_time).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${activity.status.replace('-', '-')}`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {user.role === 'Owner' && renderOwnerDashboard()}
      {user.role === 'Manager' && renderManagerDashboard()}
      {user.role === 'Farmer' && renderFarmerDashboard()}
    </div>
  );
};

export default Dashboard;







