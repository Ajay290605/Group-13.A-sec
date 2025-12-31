import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Navbar from './components/Navbar';
import RoleRedirect from './components/RoleRedirect';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <RoleRedirect />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/owner"
              element={
                <PrivateRoute allowedRoles={['Owner']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/manager"
              element={
                <PrivateRoute allowedRoles={['Manager']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/farmer"
              element={
                <PrivateRoute allowedRoles={['Farmer']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <PrivateRoute>
                  <Activities />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <Tasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute allowedRoles={['Owner', 'Manager']}>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;




