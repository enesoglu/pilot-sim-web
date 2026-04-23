import { useState, useCallback } from 'react';
import type { InstructorNote } from '../data/types';

const STORAGE_KEY = 'instructorNotes';

function loadNotes(): Record<string, InstructorNote[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, InstructorNote[]>) : {};
  } catch {
    return {};
  }
}

function saveNotes(notes: Record<string, InstructorNote[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useInstructorNotes(pilotId: string) {
  const [allNotes, setAllNotes] = useState<Record<string, InstructorNote[]>>(loadNotes);

  const notes: InstructorNote[] = allNotes[pilotId] ?? [];

  const addNote = useCallback(
    (text: string, authorName: string) => {
      const note: InstructorNote = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        pilotId,
        authorName,
        timestamp: new Date().toISOString(),
        text,
      };
      setAllNotes((prev) => {
        const updated = { ...prev, [pilotId]: [note, ...(prev[pilotId] ?? [])] };
        saveNotes(updated);
        return updated;
      });
    },
    [pilotId]
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      setAllNotes((prev) => {
        const updated = {
          ...prev,
          [pilotId]: (prev[pilotId] ?? []).filter((n) => n.id !== noteId),
        };
        saveNotes(updated);
        return updated;
      });
    },
    [pilotId]
  );

  return { notes, addNote, deleteNote };
}
