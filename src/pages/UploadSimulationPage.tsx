import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { PageHeader } from '../components/common/PageHeader';
import { usePilots } from '../hooks/usePilots';
import { SCENARIOS } from '../data/scenarios';

const STEPS = [
  'Veri kontrolü ve doğrulama',
  'Sensör verilerinin senkronizasyonu (UserTimeStamp)',
  'Gürültü temizleme ve ön işleme',
  'Özellik mühendisliği (anchored z-scores, gradients)',
  'Stres olay modeli (XGBoost) çalıştırılıyor',
  'Bilişsel yük modeli (CNN-LSTM) çalıştırılıyor',
  'Sonuçlar derleniyor',
];

const STEP_DURATION_MS = 1500;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadSimulationPage() {
  const navigate = useNavigate();
  const { pilots, loading } = usePilots();
  const activeScenarios = SCENARIOS.filter((s) => s.active);

  const [pilotId, setPilotId] = useState('');
  const [scenarioId, setScenarioId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [done, setDone] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const runAnalysis = useCallback(() => {
    setActiveStep(0);
    setDone(false);
    setModalOpen(true);

    let step = 0;
    const advance = () => {
      step += 1;
      if (step < STEPS.length) {
        setActiveStep(step);
        setTimeout(advance, STEP_DURATION_MS);
      } else {
        setDone(true);
        setTimeout(() => {
          setModalOpen(false);
          setSnackOpen(true);
          const generatedId = `${pilotId}-s${scenarioId}`;
          setTimeout(() => navigate(`/flights/${generatedId}`), 1800);
        }, 600);
      }
    };
    setTimeout(advance, STEP_DURATION_MS);
  }, [pilotId, scenarioId, navigate]);

  const canAnalyze = !!pilotId && !!scenarioId && !!file;

  return (
    <Box>
      <PageHeader
        title="Simülasyon Yükle"
        subtitle="NASA SOTERIA formatında fizyolojik veri dosyası yükleyin ve AI analizi başlatın"
      />

      {/* Selectors */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 260 }} disabled={loading}>
              <InputLabel>Pilot</InputLabel>
              <Select
                value={pilotId}
                label="Pilot"
                onChange={(e) => setPilotId(e.target.value)}
              >
                {pilots.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel>Senaryo</InputLabel>
              <Select
                value={scenarioId}
                label="Senaryo"
                onChange={(e) => setScenarioId(e.target.value)}
              >
                {activeScenarios.map((s) => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    <Typography
                      component="span"
                      sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', mr: 1 }}
                    >
                      {s.code}
                    </Typography>
                    {s.titleTr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <Card>
        <CardContent>
          <Box
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
            sx={{
              height: 320,
              border: '2px dashed',
              borderColor: isDragOver ? 'primary.main' : 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              cursor: file ? 'default' : 'pointer',
              bgcolor: isDragOver ? 'action.hover' : 'transparent',
              transition: 'all 150ms',
              '&:hover': !file ? { borderColor: 'primary.main', bgcolor: 'action.hover' } : undefined,
            }}
          >
            {!file ? (
              <>
                <UploadFileOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Simülasyon CSV dosyasını buraya bırakın veya seçin
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', maxWidth: 420 }}>
                  Beklenen format: NASA SOTERIA fizyolojik metrik formatı<br />
                  (ifd_cockpit, smarteye, abm, emp dosya bütünü)
                </Typography>
              </>
            ) : (
              <>
                <CheckCircleOutlineIcon sx={{ fontSize: 44, color: 'success.main' }} />
                <Typography variant="body1" fontWeight={600}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(file.size)}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Dosyayı Değiştir
                </Button>
              </>
            )}
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.zip"
            style={{ display: 'none' }}
            onChange={onFileInput}
          />

          {file && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                disabled={!canAnalyze}
                onClick={runAnalysis}
                sx={{ minWidth: 140 }}
              >
                Analiz Et
              </Button>
            </Box>
          )}

          {file && !canAnalyze && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
              Analiz için pilot ve senaryo seçimi zorunludur.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Analysis Stepper Modal */}
      <Dialog open={modalOpen} maxWidth="sm" fullWidth disableEscapeKeyDown>
        <DialogTitle sx={{ fontWeight: 600 }}>Analiz Yürütülüyor</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {STEPS.map((label, i) => (
              <Step key={label} completed={i < activeStep || done}>
                <StepLabel
                  icon={
                    i === activeStep && !done ? (
                      <CircularProgress size={20} thickness={5} />
                    ) : undefined
                  }
                >
                  <Typography variant="body2" fontWeight={i === activeStep ? 600 : 400}>
                    {label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="caption" color="text.secondary">
                    İşleniyor...
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600 }}>
          Analiz tamamlandı. Uçuş analizi sayfasına yönlendiriliyorsunuz...
        </Alert>
      </Snackbar>
    </Box>
  );
}
