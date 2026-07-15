import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, Typography, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, InputAdornment,
  CircularProgress, Alert, Snackbar, Stack, Autocomplete, Paper, Grid, useTheme,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjects, createProject, updateProject, deleteProject } from '../api/api';

const statusColors = {
  PLANNING: { color: '#1976D2', bg: '#E3F2FD' },
  ACTIVE: { color: '#2E7D32', bg: '#E8F5E9' },
  COMPLETED: { color: '#616161', bg: '#F5F5F5' },
};

const initialForm = { projectCode: '', projectName: '', customer: '', status: 'PLANNING', startDate: '', endDate: '' };

export default function Projects() {
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const validate = () => {
    const errs = {};
    if (!form.projectCode.trim()) errs.projectCode = 'Project Code is required';
    if (!form.projectName.trim()) errs.projectName = 'Name is required';
    if (!form.customer.trim()) errs.customer = 'Customer is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = 'End date must be after start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setForm(initialForm);
    setEditing(null);
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setForm({
      projectCode: proj.projectCode,
      projectName: proj.projectName,
      customer: proj.customer,
      status: proj.status,
      startDate: proj.startDate,
      endDate: proj.endDate,
    });
    setEditing(proj);
    setErrors({});
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setForm(initialForm);
    setEditing(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateProject(editing.projectId || editing.id, form);
        setSnackbar({ open: true, message: 'Project updated successfully', severity: 'success' });
      } else {
        await createProject(form);
        setSnackbar({ open: true, message: 'Project created successfully', severity: 'success' });
      }
      handleClose();
      await fetchProjects();
    } catch (err) {
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (proj) => {
    setDeleteTarget(proj);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget.projectId || deleteTarget.id);
      setSnackbar({ open: true, message: 'Project deleted successfully', severity: 'success' });
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchProjects();
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { field: 'projectCode', headerName: 'Code', width: 110, renderCell: (params) => (
      <Chip label={params.value} size="small" variant="outlined" color="primary" />
    )},
    { field: 'projectName', headerName: 'Project Name', flex: 1, minWidth: 150 },
    { field: 'customer', headerName: 'Customer', width: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const sc = statusColors[params.value] || statusColors.PLANNING;
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              backgroundColor: sc.bg,
              color: sc.color,
              fontWeight: 700,
            }}
          />
        );
      },
    },
    { field: 'startDate', headerName: 'Start Date', width: 120 },
    { field: 'endDate', headerName: 'End Date', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Projects</Typography>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
            Add Project
          </Button>
        </motion.div>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              sx={{ maxWidth: 300 }}
            />
            <Stack direction="row" spacing={1}>
              {['ALL', 'PLANNING', 'ACTIVE', 'COMPLETED'].map((s) => (
                <Chip
                  key={s}
                  label={s === 'ALL' ? 'All' : s}
                  variant={statusFilter === s ? 'filled' : 'outlined'}
                  color={s === 'PLANNING' ? 'info' : s === 'ACTIVE' ? 'success' : s === 'COMPLETED' ? 'default' : 'primary'}
                  onClick={() => setStatusFilter(s)}
                  sx={{ fontWeight: 600, cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>
          <DataGrid
            rows={filtered}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.projectId || row.id}
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
            maxWidth="sm"
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
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <WorkIcon sx={{ fontSize: 28, opacity: 0.9 }} />
              {editing ? 'Edit Project' : 'Add Project'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                <TextField
                  label="Project Code"
                  value={form.projectCode}
                  onChange={(e) => setForm({ ...form, projectCode: e.target.value })}
                  error={!!errors.projectCode}
                  helperText={errors.projectCode}
                  disabled={!!editing}
                  fullWidth
                />
                <TextField
                  label="Project Name"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  error={!!errors.projectName}
                  helperText={errors.projectName}
                  fullWidth
                />
                <TextField
                  label="Customer"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  error={!!errors.customer}
                  helperText={errors.customer}
                  fullWidth
                />
                <Autocomplete
                  options={['PLANNING', 'ACTIVE', 'COMPLETED']}
                  getOptionLabel={(opt) =>
                    opt === 'PLANNING' ? 'Planning' :
                    opt === 'ACTIVE' ? 'Active' : 'Completed'
                  }
                  value={form.status}
                  onChange={(_, val) => setForm({ ...form, status: val || 'PLANNING' })}
                  disableClearable
                  fullWidth
                  renderOption={(props, option) => {
                    const sc = statusColors[option] || statusColors.PLANNING;
                    return (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sc.color, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option === 'PLANNING' ? 'Planning' :
                           option === 'ACTIVE' ? 'Active' : 'Completed'}
                        </Typography>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Status"
                      placeholder="Select status..."
                      error={!!errors.status}
                      helperText={errors.status}
                    />
                  )}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                      slotProps={{ inputLabel: { shrink: true } }}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      error={!!errors.endDate}
                      helperText={errors.endDate}
                      slotProps={{ inputLabel: { shrink: true } }}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
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
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
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
