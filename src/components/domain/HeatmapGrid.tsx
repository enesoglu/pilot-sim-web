import { useState } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { cpiColor } from '../../utils/colors';

export interface HeatmapRow {
  id: string;
  label: string;
  values: (number | null)[];
}

export interface HeatmapColumn {
  id: string | number;
  label: string;
}

interface Props {
  rows: HeatmapRow[];
  columns: HeatmapColumn[];
  onCellClick?: (rowId: string, colId: string | number) => void;
  onRowLabelClick?: (rowId: string) => void;
  colorScale?: (value: number) => string;
}

const LABEL_W = 160;
const CELL_W = 80;
const CELL_H = 32;
const HEADER_H = 40;

/** CSS-Grid heatmap — no external library. Sticky row labels and column headers. */
export function HeatmapGrid({ rows, columns, onCellClick, onRowLabelClick, colorScale }: Props) {
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string | number } | null>(null);
  const getColor = colorScale ?? cpiColor;

  const totalWidth = LABEL_W + columns.length * CELL_W;

  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 520, position: 'relative' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `${LABEL_W}px ${columns.map(() => `${CELL_W}px`).join(' ')}`,
          gridTemplateRows: `${HEADER_H}px ${rows.map(() => `${CELL_H}px`).join(' ')}`,
          width: totalWidth,
        }}
      >
        {/* Top-left corner */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            zIndex: 3,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        />

        {/* Column headers */}
        {columns.map((col) => (
          <Box
            key={col.id}
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pb: 0.75,
              px: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                fontSize: '0.68rem',
                color: 'text.secondary',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {col.label}
            </Typography>
          </Box>
        ))}

        {/* Rows */}
        {rows.map((row) => (
          <>
            {/* Row label */}
            <Box
              key={`label-${row.id}`}
              onClick={() => onRowLabelClick?.(row.id)}
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 1,
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                px: 1,
                cursor: onRowLabelClick ? 'pointer' : 'default',
                '&:hover': onRowLabelClick ? { bgcolor: 'action.hover' } : undefined,
              }}
            >
              <Typography
                noWrap
                variant="caption"
                title={row.label}
                sx={{ fontSize: '0.72rem', fontWeight: 500, maxWidth: LABEL_W - 16 }}
              >
                {row.label}
              </Typography>
            </Box>

            {/* Cells */}
            {columns.map((col, colIdx) => {
              const value = row.values[colIdx] ?? null;
              const isHovered = hoveredCell?.row === row.id && hoveredCell?.col === col.id;

              return (
                <Tooltip
                  key={`cell-${row.id}-${col.id}`}
                  title={
                    value != null
                      ? `${row.label} — ${col.label}: ${value.toFixed(1)}`
                      : `${row.label} — ${col.label}: —`
                  }
                  placement="top"
                  arrow
                >
                  <Box
                    onClick={() => value != null && onCellClick?.(row.id, col.id)}
                    onMouseEnter={() => setHoveredCell({ row: row.id, col: col.id })}
                    onMouseLeave={() => setHoveredCell(null)}
                    sx={{
                      bgcolor: value != null ? getColor(value) : 'action.disabledBackground',
                      borderBottom: '1px solid',
                      borderRight: '1px solid',
                      borderColor: isHovered ? 'primary.main' : 'divider',
                      borderWidth: isHovered ? '2px' : '1px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: value != null && onCellClick ? 'pointer' : 'default',
                      transition: 'border-color 100ms',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#fff',
                        userSelect: 'none',
                      }}
                    >
                      {value != null ? value.toFixed(1) : '—'}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </>
        ))}
      </Box>
    </Box>
  );
}
