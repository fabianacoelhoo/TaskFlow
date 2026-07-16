import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <Box component="main" sx={{ flex: 1, px: { xs: 3, md: 6 }, py: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
