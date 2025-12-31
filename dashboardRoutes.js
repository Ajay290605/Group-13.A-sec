const DASHBOARD_PATHS = {
  Owner: '/dashboard/owner',
  Manager: '/dashboard/manager',
  Farmer: '/dashboard/farmer'
};

export const getDashboardPath = (role) => {
  return DASHBOARD_PATHS[role] || '/dashboard';
};



