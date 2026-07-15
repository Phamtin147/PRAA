import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, Chip,
  Alert, CircularProgress, Divider, Stack, useTheme,
} from '@mui/material';
import {
  SmartToy as AiIcon, Recommend as RecommendIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080' });

export default function AIAssistant() {
  const theme = useTheme();
  const [recommendForm, setRecommendForm] = useState({ role: 'Developer', minAvailable: 50, count: 3 });
  const [riskForm, setRiskForm] = useState({ neededResources: 2, role: 'Developer' });
  const [recommendResult, setRecommendResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [loading, setLoading] = useState({ recommend: false, risk: false });
  const [error, setError] = useState(null);

  const handleRecommend = async () => {
    setLoading({ ...loading, recommend: true });
    setError(null);
    try {
      const res = await API.post('/ai/recommend', recommendForm);
      setRecommendResult(res.data);
    } catch (err) {
      setError('Failed to get recommendations');
    } finally {
      setLoading({ ...loading, recommend: false });
    }
  };

  const handleRiskCheck = async () => {
    setLoading({ ...loading, risk: true });
    setError(null);
    try {
      const res = await API.post('/ai/risk-detection', riskForm);
      setRiskResult(res.data);
    } catch (err) {
      setError('Failed to detect risks');
    } finally {
      setLoading({ ...loading, risk: false });
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return theme.palette.error.main;
      case 'HIGH': return theme.palette.error.light;
      case 'MEDIUM': return theme.palette.warning.main;
      default: return theme.palette.success.main;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AiIcon sx={{ color: theme.palette.primary.main }} />
        AI Assistant
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <RecommendIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Resource Recommendation</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <TextField
                    label="Role"
                    value={recommendForm.role}
                    onChange={(e) => setRecommendForm({ ...recommendForm, role: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Min Available %"
                    type="number"
                    value={recommendForm.minAvailable}
                    onChange={(e) => setRecommendForm({ ...recommendForm, minAvailable: Number(e.target.value) })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Number of Recommendations"
                    type="number"
                    value={recommendForm.count}
                    onChange={(e) => setRecommendForm({ ...recommendForm, count: Number(e.target.value) })}
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleRecommend}
                    disabled={loading.recommend}
                    startIcon={loading.recommend ? <CircularProgress size={18} /> : <RecommendIcon />}
                  >
                    Get Recommendations
                  </Button>
                </Stack>
                {recommendResult && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(103,80,164,0.04)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Found {recommendResult.totalFound} available resources
                    </Typography>
                    {recommendResult.recommendedResources.map((rec, i) => (
                      <Stack key={i} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
                        <Typography variant="body2">{rec.employee}</Typography>
                        <Chip label={`${rec.available}% available`} size="small" color={rec.available > 50 ? 'success' : 'warning'} />
                      </Stack>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <WarningIcon color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Risk Detection</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <TextField
                    label="Needed Resources"
                    type="number"
                    value={riskForm.neededResources}
                    onChange={(e) => setRiskForm({ ...riskForm, neededResources: Number(e.target.value) })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Role"
                    value={riskForm.role}
                    onChange={(e) => setRiskForm({ ...riskForm, role: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleRiskCheck}
                    disabled={loading.risk}
                    startIcon={loading.risk ? <CircularProgress size={18} /> : <WarningIcon />}
                  >
                    Check Risks
                  </Button>
                </Stack>
                {riskResult && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Risk Level: </Typography>
                      <Chip
                        label={riskResult.riskLevel}
                        size="small"
                        sx={{ bgcolor: getRiskColor(riskResult.riskLevel), color: '#fff', fontWeight: 700 }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Team capacity: {riskResult.teamCapacity}
                    </Typography>
                    {riskResult.risks.map((risk, i) => (
                      <Alert
                        key={i}
                        severity={risk.severity === 'CRITICAL' ? 'error' : risk.severity === 'HIGH' ? 'warning' : 'info'}
                        sx={{ mb: 1, borderRadius: 2 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{risk.message}</Typography>
                        <Typography variant="caption">{risk.recommendation}</Typography>
                      </Alert>
                    ))}
                    {riskResult.risks.length === 0 && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body2">No risks detected</Typography>
                      </Stack>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>
      )}
    </motion.div>
  );
}