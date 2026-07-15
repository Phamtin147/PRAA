import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Chip, Grid, CircularProgress,
  useTheme, Avatar, Stack, MenuItem, TextField,
} from '@mui/material';
import {
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { getUtilizationReport, getAvailableResources, getOverloadedEmployees } from '../api/api';

function ProgressRing({ percent, size = 100, strokeWidth = 8, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} role="img" aria-label="Progress: {percent}%">
        <title>{percent}% allocation</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color || theme.palette.primary.main}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Typography
        variant="h6"
        sx={{ position: 'absolute', fontWeight: 800, fontSize: size * 0.2 }}
      >
        {percent}%
      </Typography>
    </Box>
  );
}

function TabPanel({ children, value, index }) {
  return value === index ? (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ pt: 3 }}>{children}</Box>
    </motion.div>
  ) : null;
}

export default function Reports() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [utilization, setUtilization] = useState([]);
  const [available, setAvailable] = useState([]);
  const [overloaded, setOverloaded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [utilData, availData, overloadData] = await Promise.all([
          getUtilizationReport(), getAvailableResources(), getOverloadedEmployees(),
        ]);
        setUtilization(utilData);
        setAvailable(availData);
        setOverloaded(overloadData);
      } catch (err) {
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const sortedUtil = [...utilization].sort((a, b) => b.totalAllocation - a.totalAllocation);
  const roles = [...new Set(available.map((a) => a.role))];
  const filteredAvailable = roleFilter === 'ALL'
    ? available
    : available.filter((a) => a.role === roleFilter);

  const barColors = ['#6750A4', '#00BFA5', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#4CAF50', '#00BCD4'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Reports</Typography>

      <Card>
        <CardContent sx={{ pb: '0 !important' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' },
              '& .Mui-selected': { color: theme.palette.primary.main },
              '& .MuiTabs-indicator': { backgroundColor: theme.palette.primary.main, height: 3, borderRadius: 1.5 },
            }}
          >
            <Tab label="Utilization" />
            <Tab label="Available Resources" />
            <Tab label="Overloaded" />
          </Tabs>
        </CardContent>
      </Card>

      <TabPanel value={tab} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Employee Allocation %
            </Typography>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={sortedUtil}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                <YAxis
                  type="category"
                  dataKey="employeeName"
                  tick={{ fontSize: 12 }}
                  width={90}
                />
                <ReTooltip
                  formatter={(value) => [`${value}%`, 'Allocation']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="totalAllocation" radius={[0, 6, 6, 0]} maxBarSize={30}>
                  {sortedUtil.map((entry, index) => (
                    <Cell key={entry.employeeName} fill={barColors[index % barColors.length]} />
                  ))}
                  <LabelList dataKey="totalAllocation" position="right" formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            select
            size="small"
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            {roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        </Box>
        <Grid container spacing={3}>
          {filteredAvailable.map((resource, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={resource.employeeId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <Card sx={{ textAlign: 'center', py: 3 }}>
                  <CardContent>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                      <ProgressRing
                        percent={resource.available}
                        size={110}
                        color={resource.available > 50 ? theme.palette.success.main :
                          resource.available > 20 ? theme.palette.warning.main :
                          theme.palette.error.main}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {resource.employeeName}
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Chip label={resource.role} size="small" variant="outlined" color="primary" />
                      <Chip label={resource.department} size="small" variant="outlined" color="secondary" />
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
          {filteredAvailable.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No resources found for the selected role.
              </Typography>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        {overloaded.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No overloaded employees
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All employees are within acceptable allocation limits.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {overloaded.map((emp, index) => (
              <Grid item xs={12} sm={6} md={4} key={emp.employeeId}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    sx={{
                      border: `2px solid ${theme.palette.error.main}40`,
                      position: 'relative',
                      overflow: 'visible',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 16,
                        bgcolor: theme.palette.error.main,
                        color: '#fff',
                        borderRadius: 20,
                        px: 1.5,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <WarningIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {emp.totalAllocation}%
                      </Typography>
                    </Box>
                    <CardContent sx={{ pt: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.main }}>
                          <PeopleIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {emp.employeeName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {emp.role} · {emp.department}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Current Allocations:
                        </Typography>
                        {emp.allocations?.map((alloc) => {
                          const projName = alloc.projectName || `Project #${alloc.projectId}`;
                          return (
                            <Box
                              key={alloc.id}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(244,67,54,0.04)',
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body2">{projName}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                                {alloc.allocationPercent}%
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          Overloaded by {emp.totalAllocation - 100}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </motion.div>
  );
}
