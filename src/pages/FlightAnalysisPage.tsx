
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PageHeader } from '../components/common/PageHeader';

export default function FlightAnalysisPage() {
  const { flightId } = useParams<{ flightId: string }>();
  return (
    <Box>
      <PageHeader
        title="Uçuş Analizi"
        breadcrumbs={[{ label: 'Uçuşlar' }, { label: flightId ?? '' }]}
      />
      <Typography color="text.secondary">(Phase 3'te tamamlanacak) Uçuş ID: {flightId}</Typography>
    </Box>
  );
}
