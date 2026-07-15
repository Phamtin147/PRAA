import { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, List, ListItem,
  ListItemAvatar, ListItemText, Avatar, Chip, useTheme,
} from '@mui/material';
import {
  People as PeopleIcon, Work as WorkIcon, Assignment as AssignmentIcon,
  BarChart as BarChartIcon, CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { getEmployees, getProjects, getAllocations, getUtilizationReport } from '../api/api';

function CountUp({ end, duration = 1.5, suffix = '' }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (val) => Math.round(val));
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    const controls = animate(count, end, { duration, ease: 'easeOut' });
    return () => { unsubscribe(); controls.stop(); };
  }, [end, duration, count, rounded]);

  return <span>{display}{suffix}</span>;
}

function StatCard({ icon, label, value, suffix, gradient, delay = 0 }) {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card
        sx={{
          background: gradient,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}>
                {label}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                <CountUp end={value} suffix={suffix} />
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 56,
                height: 56,
                '& .MuiSvgIcon-root': { fontSize: 28 },
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ employees: 0, projects: 0, allocations: 0, utilization: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emps, projs, allocs, report] = await Promise.all([
          getEmployees(), getProjects(), getAllocations(), getUtilizationReport(),
        ]);
        const activeProjects = projs.filter((p) => p.status === 'ACTIVE').length;
        const avgUtil = report.length > 0
          ? Math.round(report.reduce((s, r) => s + r.totalAllocation, 0) / report.length)
          : 0;

        setStats({
          employees: emps.length,
          projects: activeProjects,
          allocations: allocs.length,
          utilization: avgUtil,
        });

        const chart = report
          .map((r) => ({ name: r.employeeName.split(' ')[0], allocation: r.totalAllocation }))
          .sort((a, b) => b.allocation - a.allocation);
        setChartData(chart);

        const recent = allocs
          .sort((a, b) => b.id - a.id)
          .slice(0, 6)
          .map((a) => {
            const emp = emps.find((e) => e.id === a.employeeId);
            const proj = projs.find((p) => p.id === a.projectId);
            return {
              id: a.id,
              text: `${emp?.fullName || 'Unknown'} allocated ${a.allocationPercent}% to ${proj?.name || 'Unknown'}`,
              date: a.startDate,
              type: a.allocationPercent > 80 ? 'high' : a.allocationPercent > 50 ? 'medium' : 'low',
            };
          });
        setRecentActivity(recent);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const accentColors = ['#6750A4', '#2196F3', '#00BFA5', '#FF9800'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon />}
            label="Total Employees"
            value={stats.employees}
            gradient="linear-gradient(135deg, #6750A4, #9A82DB)"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<WorkIcon />}
            label="Active Projects"
            value={stats.projects}
            gradient="linear-gradient(135deg, #2196F3, #64B5F6)"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentIcon />}
            label="Total Allocations"
            value={stats.allocations}
            gradient="linear-gradient(135deg, #00BFA5, #5DF2D6)"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<BarChartIcon />}
            label="Avg Utilization"
            value={stats.utilization}
            suffix="%"
            gradient="linear-gradient(135deg, #FF9800, #FFB74D)"
            delay={0.3}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Allocation Overview
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <ReTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [`${value}%`, 'Allocation']}
                    />
                    <Bar dataKey="allocation" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.name} fill={accentColors[index % accentColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Recent Activity
                </Typography>
                <List sx={{ py: 0 }}>
                  {recentActivity.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.08 }}
                    >
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          px: 0,
                          borderBottom: index < recentActivity.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor:
                                item.type === 'high' ? theme.palette.error.light :
                                item.type === 'medium' ? theme.palette.warning.light :
                                theme.palette.success.light,
                            }}
                          >
                            {item.type === 'high' ? <ScheduleIcon sx={{ fontSize: 16 }} /> :
                             item.type === 'medium' ? <WorkIcon sx={{ fontSize: 16 }} /> :
                             <CheckCircleIcon sx={{ fontSize: 16 }} />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.text}
                            </Typography>
                          }
                          secondary={item.date}
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}
