import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { InstructorNote } from '../../data/types';
import { fmtRelativeTime } from '../../utils/format';

interface Props {
  note: InstructorNote;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Card variant="outlined" sx={{ mb: 1.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="caption" fontWeight={600}>
                {note.authorName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {fmtRelativeTime(note.timestamp)}
              </Typography>
            </Box>
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {note.text}
          </Typography>
        </CardContent>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setConfirmOpen(true);
          }}
          sx={{ color: 'error.main', fontSize: '0.85rem' }}
        >
          Sil
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirmOpen}
        title="Notu sil"
        description="Bu not kalıcı olarak silinecektir. Emin misiniz?"
        confirmLabel="Sil"
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(note.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
