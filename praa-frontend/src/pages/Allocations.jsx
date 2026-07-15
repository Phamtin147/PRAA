import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, IconButton, Tooltip, Autocomplete,
  Slider, CircularProgress, Alert, Snackbar, Grid, useTheme,
  LinearProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon, WorkHistory as WorkHistoryIcon,
  Person as PersonIcon, CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllocations, createAllocation, updateAllocation, deleteAllocation,
  getEmployees, getProjects, getWorkload } from '../api/api';

const initialForm = {
  employeeId: null, projectId: null, allocationPercent: 50,
  roleInProject: '', startDate: '', endDate: '',
};

export default function Allocations() {
  const theme = useTheme();
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [allocs, emps, projs] = await Promise.all([
        getAllocations(), getEmployees(), getProjects(),
      ]);
      setAllocations(allocs);
      setEmployees(emps);
      setProjects(projs);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const fetchWorkload = useCallback(async (empId) => {
    if (!empId) { setWorkload(null); return; }
    try {
      const wl = await getWorkload(empId);
      setWorkload(wl);
    } catch {
      setWorkload(null);
    }
  }, []);

  useEffect(() => {
    if (form.employeeId) fetchWorkload(form.employeeId);
    else setWorkload(null);
  }, [form.employeeId, fetchWorkload]);

  const remainingPercent = workload ? 100 - workload.totalAllocation : 100;
  const isValidAllocation = form.allocationPercent <= remainingPercent && form.allocationPercent > 0;
  const allocStatus = !form.employeeId ? 'none' : isValidAllocation ? 'valid' : 'exceeded';

  const validate = () => {
    const errs = {};
    if (!form.employeeId) errs.employeeId = 'Employee is required';
    if (!form.projectId) errs.projectId = 'Project is required';
    if (!form.allocationPercent || form.allocationPercent < 1 || form.allocationPercent > 100) {
      errs.allocationPercent = 'Allocation must be between 1-100';
    }
    if (!form.roleInProject.trim()) errs.roleInProject = 'Role is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = 'End date must be after start date';
    }
    if (form.employeeId && !isValidAllocation) {
      errs.allocationPercent = 'Allocation exceeds available capacity!';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setForm(initialForm);
    setEditing(null);
    setWorkload(null);
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (alloc) => {
    setForm({
      employeeId: alloc.employeeId,
      projectId: alloc.projectId,
      allocationPercent: alloc.allocationPercent,
      roleInProject: alloc.roleInProject,
      startDate: alloc.startDate,
      endDate: alloc.endDate,
    });
    setEditing(alloc);
    setErrors({});
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setForm(initialForm);
    setEditing(null);
    setWorkload(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateAllocation(editing.id, form);
        setSnackbar({ open: true, message: 'Allocation updated successfully', severity: 'success' });
      } else {
        await createAllocation(form);
        setSnackbar({ open: true, message: 'Allocation created successfully', severity: 'success' });
      }
      handleClose();
      await fetchAllData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (alloc) => {
    setDeleteTarget(alloc);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAllocation(deleteTarget.id);
      setSnackbar({ open: true, message: 'Allocation deleted successfully', severity: 'success' });
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchAllData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const getEmpName = (id) => employees.find((e) => e.employeeId === id)?.fullName || 'Unknown';
  const getProjName = (id) => projects.find((p) => p.projectId === id)?.projectName || 'Unknown';

  const allocColor = (pct) => {
    if (pct > 90) return theme.palette.error.main;
    if (pct > 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const columns = [
    { field: 'employeeName', headerName: 'Employee', flex: 1, minWidth: 150,
      valueGetter: (value, row) => getEmpName(row.employeeId) },
    { field: 'projectName', headerName: 'Project', flex: 1, minWidth: 150,
      valueGetter: (value, row) => getProjName(row.projectId) },
    { field: 'allocationPercent', headerName: 'Allocation %', width: 150,
      renderCell: (params) => {
        const pct = params.value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 1 }}>
            <Box sx={{ flex: 1, borderRadius: 5, overflow: 'hidden' }}>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(103,80,164,0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${allocColor(pct)}bb, ${allocColor(pct)})`,
                    borderRadius: 5,
                    boxShadow: `0 1px 4px ${allocColor(pct)}66`,
                  },
                }}
              />
            </Box>
            <Typography variant="body2" sx={{
              fontWeight: 800,
              minWidth: 40,
              color: allocColor(pct),
              fontSize: '0.8125rem',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {pct}%
            </Typography>
          </Box>
        );
      },
    },
    { field: 'roleInProject', headerName: 'Role', width: 140 },
    { field: 'startDate', headerName: 'Start', width: 110 },
    { field: 'endDate', headerName: 'End', width: 110 },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit allocation" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(params.row)}
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(103,80,164,0.12)' : 'rgba(103,80,164,0.08)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete allocation" arrow>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              sx={{
                color: theme.palette.error.main,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(244,67,54,0.12)' : 'rgba(244,67,54,0.08)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: theme.palette.error.main,
                  color: '#fff',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const selectedEmployee = employees.find((e) => e.employeeId === form.employeeId);
  const availableProjects = editing
    ? projects
    : projects.filter((p) => p.status !== 'COMPLETED');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        mb: 4, pb: 2.5, borderBottom: `2px solid ${theme.palette.divider}`,
      }}>
        <Box>
          <Typography variant="h4" sx={{
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            Allocations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            Manage resource allocation across projects
          </Typography>
        </Box>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="contained" onClick={handleOpenAdd} sx={{ px: 3, py: 1 }}>
            Add Allocation
          </Button>
        </motion.div>
      </Box>

      <DataGrid
        rows={allocations}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.allocationId || row.id}
        pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': { py: 1.5 },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(103,80,164,0.04)',
            borderRadius: 1,
          },
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(103,80,164,0.03)' },
          },
        }}
      />

      <AnimatePresence>
        {dialogOpen && (
          <Dialog
            open={dialogOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            sx={{ '& .MuiPaper-root': { borderRadius: '16px !important', overflow: 'hidden' } }}
          >
            <DialogTitle sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: '#fff',
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}>
              <WorkHistoryIcon sx={{ fontSize: 28, opacity: 0.9 }} />
              {editing ? 'Edit Allocation' : 'New Allocation'}
            </DialogTitle>
            <DialogContent sx={{
              px: 3,
              py: 3,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { borderRadius: 3, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(103,80,164,0.25)' }
            }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{
                    p: 3,
                    borderRadius: 3,
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(103,80,164,0.04)',
                    border: `1px solid ${theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(103,80,164,0.1)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                  }}>
                    <Typography variant="overline" sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: '0.12em',
                      color: theme.palette.primary.main,
                      display: 'block',
                    }}>
                      <PersonIcon sx={{ fontSize: 15, mr: 0.6, verticalAlign: 'text-top' }} />
                      ASSIGNMENT
                    </Typography>

                    <Autocomplete
                      fullWidth
                      options={employees}
                      getOptionLabel={(opt) => `${opt.employeeCode} - ${opt.fullName}`}
                      value={selectedEmployee || null}
                      onChange={(_, val) => setForm({ ...form, employeeId: val?.employeeId || null })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Employee"
                          error={!!errors.employeeId}
                          helperText={errors.employeeId}
                        />
                      )}
                      isOptionEqualToValue={(opt, val) => opt.employeeId === val.employeeId}
                    />

                    <Autocomplete
                      fullWidth
                      options={availableProjects}
                      getOptionLabel={(opt) => `${opt.projectCode} - ${opt.projectName}`}
                      value={projects.find((p) => p.projectId === form.projectId) || null}
                      onChange={(_, val) => setForm({ ...form, projectId: val?.projectId || null })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Project"
                          error={!!errors.projectId}
                          helperText={errors.projectId}
                        />
                      )}
                      isOptionEqualToValue={(opt, val) => opt.projectId === val.projectId}
                    />

                    <TextField
                      label="Role in Project"
                      value={form.roleInProject}
                      onChange={(e) => setForm({ ...form, roleInProject: e.target.value })}
                      error={!!errors.roleInProject}
                      helperText={errors.roleInProject}
                      fullWidth
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{
                    p: 3,
                    borderRadius: 3,
                    height: '100%',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(103,80,164,0.04)',
                    border: `1px solid ${theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(103,80,164,0.1)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                  }}>
                    <Typography variant="overline" sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: '0.12em',
                      color: theme.palette.primary.main,
                      display: 'block',
                    }}>
                      <CalendarMonthIcon sx={{ fontSize: 15, mr: 0.6, verticalAlign: 'text-top' }} />
                      ALLOCATION & DATES
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h3" sx={{
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                        fontSize: { xs: '2rem', md: '2.25rem' },
                        minWidth: 72,
                        textAlign: 'center',
                        color: allocStatus === 'exceeded'
                          ? theme.palette.error.main
                          : form.allocationPercent > 70
                            ? theme.palette.warning.main
                            : theme.palette.success.main,
                        transition: 'color 0.3s ease',
                      }}>
                        {form.allocationPercent}%
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Slider
                          value={form.allocationPercent}
                          onChange={(_, val) => setForm({ ...form, allocationPercent: val })}
                          min={1}
                          max={100}
                          valueLabelDisplay="auto"
                          marks={[
                            { value: 0, label: '0%' },
                            { value: 25, label: '25%' },
                            { value: 50, label: '50%' },
                            { value: 75, label: '75%' },
                            { value: 100, label: '100%' },
                          ]}
                          sx={{
                            '& .MuiSlider-track': {
                              background: allocStatus === 'exceeded'
                                ? theme.palette.error.main
                                : form.allocationPercent > 70
                                  ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.warning.main})`
                                  : theme.palette.success.main,
                              border: 'none',
                              height: 6,
                              borderRadius: 3,
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(103,80,164,0.12)',
                              height: 6,
                              borderRadius: 3,
                            },
                            '& .MuiSlider-thumb': {
                              width: 20,
                              height: 20,
                              backgroundColor: '#fff',
                              boxShadow: allocStatus === 'exceeded'
                                ? `0 2px 8px ${theme.palette.error.main}66`
                                : `0 2px 8px rgba(103,80,164,0.4)`,
                              border: `2px solid ${allocStatus === 'exceeded' ? theme.palette.error.main : theme.palette.primary.main}`,
                              '&:hover, &.Mui-focusVisible': {
                                boxShadow: allocStatus === 'exceeded'
                                  ? `0 0 0 8px ${theme.palette.error.main}22`
                                  : `0 0 0 8px rgba(103,80,164,0.2)`,
                              },
                            },
                            '& .MuiSlider-markLabel': {
                              fontSize: '0.65rem',
                              fontWeight: 600,
                            },
                            '& .MuiSlider-mark': {
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(103,80,164,0.2)',
                              height: 8,
                              width: 2,
                            },
                            '& .MuiSlider-markActive': {
                              backgroundColor: allocStatus === 'exceeded' ? theme.palette.error.main : theme.palette.primary.main,
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {form.employeeId && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            px: 1.25,
                            py: 0.35,
                            borderRadius: 1,
                            backgroundColor: allocStatus === 'exceeded'
                              ? `${theme.palette.error.main}18`
                              : `${theme.palette.success.main}18`,
                          }}>
                            <Typography variant="caption" sx={{
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              color: allocStatus === 'exceeded'
                                ? theme.palette.error.main
                                : theme.palette.success.main,
                            }}>
                              {allocStatus === 'valid' ? '✓ Valid' : '✗ Exceeded'}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Available: {remainingPercent}%
                          </Typography>
                          <Box sx={{ flex: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            100% cap
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={form.allocationPercent}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(103,80,164,0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: allocStatus === 'exceeded'
                                ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`
                                : form.allocationPercent > 70
                                  ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.warning.main})`
                                  : `linear-gradient(90deg, ${theme.palette.success.main}88, ${theme.palette.success.main})`,
                              borderRadius: 3,
                              boxShadow: `0 1px 4px ${allocStatus === 'exceeded' ? theme.palette.error.main : theme.palette.success.main}44`,
                            },
                          }}
                        />
                      </>
                    )}

                    {workload && (
                      <Box sx={{
                        p: 2,
                        borderRadius: 2.5,
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(103,80,164,0.12), rgba(103,80,164,0.04))'
                          : 'linear-gradient(135deg, rgba(103,80,164,0.06), rgba(103,80,164,0.02))',
                        border: `1px solid ${theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(103,80,164,0.08)'}`,
                      }}>
                        <Typography variant="caption" sx={{
                          fontWeight: 600,
                          fontSize: '0.6rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: theme.palette.text.secondary,
                          mb: 0.75,
                          display: 'block',
                        }}>
                          Current Workload
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                          mb: 1.5,
                          fontSize: '0.75rem',
                        }}>
                          {selectedEmployee?.fullName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                          <Typography variant="h5" sx={{
                            fontWeight: 800,
                            color: workload.totalAllocation > 80 ? theme.palette.error.main : theme.palette.primary.main,
                          }}>
                            {workload.totalAllocation}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            allocated of 100%
                          </Typography>
                        </Box>
                        <Box sx={{
                          width: '100%',
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(103,80,164,0.08)',
                          overflow: 'hidden',
                        }}>
                          <Box sx={{
                            width: `${Math.min(workload.totalAllocation, 100)}%`,
                            height: '100%',
                            borderRadius: 2,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${workload.totalAllocation > 80 ? theme.palette.error.main : theme.palette.primary.light})`,
                            transition: 'width 0.4s ease',
                          }} />
                        </Box>
                      </Box>
                    )}

                    <Box sx={{
                      height: '1px',
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(103,80,164,0.12)',
                    }} />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                        InputLabelProps={{ shrink: true }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                      />
                      <TextField
                        label="End Date"
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                        InputLabelProps={{ shrink: true }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleClose} color="inherit">Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} /> : null}>
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this allocation?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
}
