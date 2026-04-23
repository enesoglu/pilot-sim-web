import type { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

export function KPICard({ title, value, subtitle, icon }: Props) {
  return (
    <Card>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {title}
          </Typography>
          {icon && <Box sx={{ color: 'text.secondary', opacity: 0.7 }}>{icon}</Box>}
        </Box>
        <Typography
          sx={{
            fontSize: '1.8rem',
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.78rem' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
