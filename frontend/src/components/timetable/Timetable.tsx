import React, { useState } from 'react';
import type { TimetableProps, TimetableEntry } from './TimetableTypes';
import { DAYS, ALL_TIMES, TIME_TO_ROW, eventColor, styles, ALL_ROOMS, ROW_HEIGHT } from './TimetableStyles';

const tut: Record<number, string> = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F' };

export const Timetable: React.FC<TimetableProps> = ({ timetable }) => {
  const [filter, setFilter] = useState<'all' | 'lecture' | 'tutorial'>('all');
  const [hoveredEntry, setHoveredEntry] = useState<TimetableEntry | null>(null);

  const filtered = timetable.filter((e) => filter === 'all' || e.type === filter);

  const byDay: Record<string, TimetableEntry[]> = {};
  DAYS.forEach((d) => { byDay[d] = []; });
  filtered.forEach((e) => { if (byDay[e.day]) byDay[e.day].push(e); });

  const getRowStart = (e: TimetableEntry) => TIME_TO_ROW[e.time_start] ?? 1;
  const getRowEnd   = (e: TimetableEntry) => TIME_TO_ROW[e.time_end]   ?? 2;

  return (
    <div style={styles.wrapper}>
      {/* Filter bar */}
      <div style={styles.filterBar}>
        {(['all', 'lecture', 'tutorial'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={styles.gridWrapper}>
        <div style={styles.timeAxis}>
          <div style={styles.timeAxisHeader} />
          {ALL_TIMES.map((t) => (
            <div key={t} style={styles.timeLabel}>{t}</div>
          ))}
        </div>

        <div style={styles.dayColumns}>
          {DAYS.map((day) => (
          <div key={day} style={styles.dayColumn}>
            <div style={styles.dayHeader}>{day}</div>

            {/* Room sub-headers */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ALL_ROOMS.length}, 1fr)`, borderBottom: '1px solid var(--border)' }}>
              {ALL_ROOMS.map((room) => (
                <div key={room} style={{
                  fontSize: '0.65rem',
                  color: 'var(--white-dim)',
                  textAlign: 'center',
                  padding: '0.2rem 0',
                  borderLeft: '1px solid var(--border)',
                  letterSpacing: '0.05em',
                }}>
                  {room}
                </div>
              ))}
            </div>

            {/* Grid: rows = time slots, columns = rooms */}
            <div style={{
              display: 'grid',
              gridTemplateRows: `repeat(${ALL_TIMES.length}, ${ROW_HEIGHT}px)`,
              gridTemplateColumns: `repeat(${ALL_ROOMS.length}, 1fr)`,
              position: 'relative',
              flex: 1,
              }}>
              {/* Hour lines across all columns */}
              {ALL_TIMES.map((_, i) =>
                ALL_ROOMS.map((_, j) => (
                  <div key={`${i}-${j}`} style={{
                    borderTop: '1px solid rgba(90,32,32,0.3)',
                    borderLeft: '1px solid rgba(90,32,32,0.2)',
                    gridRow: `${i + 1} / ${i + 2}`,
                    gridColumn: `${j + 1} / ${j + 2}`,
                    pointerEvents: 'none',
                  }} />
                ))
              )}

              {/* Events */}
              {byDay[day].map((entry, idx) => {
                const rowStart  = getRowStart(entry);
                const rowEnd    = getRowEnd(entry);
                const colIndex  = ALL_ROOMS.indexOf(entry.room) + 1;
                const colors    = eventColor(entry.type, entry.event);
                const isHovered = hoveredEntry === entry;

                if (colIndex === 0) return null; // unknown room

                return (
                  <div
                    key={idx}
                    style={{
                      gridRow: `${rowStart} / ${rowEnd}`,
                      gridColumn: `${colIndex} / ${colIndex + 1}`,
                      margin: '2px',
                      borderRadius: '3px',
                      padding: '0.25rem 0.35rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.1rem',
                      cursor: 'default',
                      overflow: 'hidden',
                      transition: 'transform 0.12s, box-shadow 0.12s',
                      zIndex: 1,
                      background: colors.bg,
                      boxShadow: isHovered
                        ? `0 4px 20px rgba(0,0,0,0.5), inset 0 0 0 1px ${colors.border}`
                        : '0 2px 8px rgba(0,0,0,0.3)',
                      transform: isHovered ? 'scale(1.02)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredEntry(entry)}
                    onMouseLeave={() => setHoveredEntry(null)}
                  >
                    <span style={{ fontSize: '0.4rem', fontWeight: 400, color: 'var(--white)', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {typeof entry.event === 'number' ? `Group ${entry.event + 1}` : entry.event}
                    </span>
                    <span style={{ fontSize: '0.3rem', color: 'var(--white-dim)' }}>
                      {entry.type === 'lecture' ? '' : `Tut ${tut[entry.tutorial]}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};