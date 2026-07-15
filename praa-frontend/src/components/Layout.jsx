import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon,
  Work as WorkIcon, Assignment as AssignmentIcon, BarChart as BarChartIcon,
  ChevronLeft as ChevronLeftIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon,
  SmartToy as AiIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 68;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
  { text: 'Projects', icon: <WorkIcon />, path: '/projects' },
  { text: 'Allocations', icon: <AssignmentIcon />, path: '/allocations' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'AI Assistant', icon: <AiIcon />, path: '/ai' },
];

export default function Layout({ toggleTheme, isDarkMode }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerWidth = open ? DRAWER_WIDTH : DRAWER_COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 27, 36, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          color: theme.palette.text.primary,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2, color: theme.palette.primary.main }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              flexGrow: 1,
            }}
          >
            PRAA
          </Typography>
          <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleTheme} sx={{ color: theme.palette.primary.main }}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={() => isMobile && setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            overflowX: 'hidden',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                background: `linear-gradient(135deg, #6750A4, #00BFA5)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: open ? '1.5rem' : '0',
                opacity: open ? 1 : 0,
                transition: 'all 0.3s ease',
              }}
            >
              PRAA
            </Typography>
            {!open && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  background: `linear-gradient(135deg, #6750A4, #00BFA5)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                P
              </Typography>
            )}
          </motion.div>
        </Toolbar>

        <List sx={{ px: open ? 1.5 : 0.5 }}>
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
              >
                <Tooltip title={!open ? item.text : ''} placement="right" arrow>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => { navigate(item.path); isMobile && setOpen(false); }}
                      sx={{
                        borderRadius: 3,
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        backgroundColor: isActive ? `${theme.palette.primary.main}18` : 'transparent',
                        '&:hover': {
                          backgroundColor: isActive 
                            ? `${theme.palette.primary.main}28` 
                            : `${theme.palette.primary.main}0A`,
                        },
                        '& .MuiListItemIcon-root': {
                          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                        },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <AnimatePresence>
                        {open && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <ListItemText
                              primary={item.text}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                  fontSize: '0.9rem',
                                },
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              </motion.div>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Box>
    </Box>
  );
}
