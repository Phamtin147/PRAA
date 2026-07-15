import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, IconButton, Tooltip, Autocomplete,
  Slider, CircularProgress, Alert, Snackbar, Grid, Stack, useTheme,
  LinearProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon, Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
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
    { field: 'allocationPercent', headerName: 'Allocation %', width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: allocColor(params.value),
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 35, color: allocColor(params.value) }}>
            {params.value}%
          </Typography>
        </Box>
      ),
    },
    { field: 'roleInProject', headerName: 'Role', width: 140 },
    { field: 'startDate', headerName: 'Start', width: 110 },
    { field: 'endDate', headerName: 'End', width: 110 },
    {
      field: 'actions', headerName: 'Actions', width: 110, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenEdit(params.row)} sx={{ color: theme.palette.primary.main }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDeleteClick(params.row)} sx={{ color: theme.palette.error.main }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Allocations</Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="contained" onClick={handleOpenAdd}>
            Add Allocation
          </Button>
        </motion.div>
      </Box>

      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      <AnimatePresence>
        {dialogOpen && (
          <Dialog
            open={dialogOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
              component: motion.div,
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.9 },
            }}
          >
            <DialogTitle sx={{ fontWeight: 700 }}>
              {editing ? 'Edit Allocation' : 'Add Allocation'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ pt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom sx={{ fontWeight: 500 }}>
                    Allocation %: <strong>{form.allocationPercent}%</strong>
                  </Typography>
                  <Slider
                    value={form.allocationPercent}
                    onChange={(_, val) => setForm({ ...form, allocationPercent: val })}
                    min={1}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{
                      '& .MuiSlider-track': {
                        backgroundColor: allocStatus === 'exceeded' ? theme.palette.error.main : theme.palette.primary.main,
                      },
                      '& .MuiSlider-thumb': {
                        backgroundColor: allocStatus === 'exceeded' ? theme.palette.error.main : theme.palette.primary.main,
                      },
                    }}
                  />
                  {form.employeeId && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Available: {remainingPercent}%
                        </Typography>
                        {allocStatus === 'valid' && (
                          <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
                        )}
                        {allocStatus === 'exceeded' && (
                          <WarningIcon sx={{ color: theme.palette.error.main, fontSize: 18 }} />
                        )}
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={form.allocationPercent}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: allocStatus === 'exceeded' ? theme.palette.error.main :
                              form.allocationPercent > 70 ? theme.palette.warning.main : theme.palette.success.main,
                            borderRadius: 3,
                          },
                        }}
                      />
                      {allocStatus === 'exceeded' && (
                        <Alert severity="error" sx={{ mt: 1, py: 0, borderRadius: 2 }}>
                          Exceeds available capacity!
                        </Alert>
                      )}
                      {allocStatus === 'valid' && (
                        <Alert severity="success" sx={{ mt: 1, py: 0, borderRadius: 2 }}>
                          Valid allocation
                        </Alert>
                      )}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {workload && (
                    <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(103,80,164,0.04)' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Current Workload for {selectedEmployee?.fullName}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {workload.totalAllocation}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Currently allocated across projects
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Role in Project"
                    value={form.roleInProject}
                    onChange={(e) => setForm({ ...form, roleInProject: e.target.value })}
                    error={!!errors.roleInProject}
                    helperText={errors.roleInProject}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
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
