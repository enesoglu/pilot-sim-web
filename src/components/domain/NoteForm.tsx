import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface Props {
  onAdd: (text: string) => void;
}

export function NoteForm({ onAdd }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        multiline
        minRows={3}
        fullWidth
        placeholder="Pilot hakkında not ekleyin..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        size="small"
        sx={{ mb: 1 }}
      />
      <Button
        variant="contained"
        size="small"
        disabled={!text.trim()}
        onClick={handleSubmit}
      >
        Not Ekle
      </Button>
    </Box>
  );
}
