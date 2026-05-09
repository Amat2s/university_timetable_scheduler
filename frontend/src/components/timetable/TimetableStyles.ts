export const ROW_HEIGHT = 60;

export const ALL_TIMES = [
  '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const LECTURE_ROOMS = ['L1', 'L2'];
export const TUTORIAL_ROOMS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
export const ALL_ROOMS = [...LECTURE_ROOMS, ...TUTORIAL_ROOMS]; // 8 total


export const TIME_TO_ROW: Record<string, number> = {};
ALL_TIMES.forEach((t, i) => { TIME_TO_ROW[t] = i + 1; });

export function eventColor(type: 'lecture' | 'tutorial', event: string | number) {
  if (type === 'lecture') {
    return {
      bg: 'rgba(122,13,13,0.55)',
      border: 'var(--crimson-light)',
      label: 'LEC',
      labelBg: 'var(--crimson)',
    };
  }
  return {
    bg: 'rgba(201,168,76,0.15)',
    border: 'var(--gold-dim)',
    label: `TUT ${typeof event === 'number' ? event + 1 : event}`,
    labelBg: 'var(--gold-dim)',
  };
}

export const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    fontFamily: "'Crimson Text', Georgia, serif",
    color: 'var(--white)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  filterBar: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterBtn: {
    fontFamily: "'Crimson Text', serif",
    fontSize: '0.95rem',
    padding: '0.3rem 1rem',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--white-dim)',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: 'var(--crimson)',
    borderColor: 'var(--crimson-light)',
    color: 'var(--gold-light)',
  },
  gridWrapper: {
    display: 'flex',
    gap: 0,
    overflowX: 'auto',
  },
  timeAxis: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    width: '52px',
  },
  timeAxisHeader: {
    height: '63px',
    flexShrink: 0,
  },
  timeLabel: {
    height: `${ROW_HEIGHT}px`,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingRight: '0.5rem',
    paddingTop: '4px',
    fontSize: '0.75rem',
    color: 'var(--white-dim)',
    flexShrink: 0,
    borderTop: '1px solid var(--border)',
  },
  dayColumns: {
    display: 'flex',
    flex: 1,
    gap: 0,
  },
  dayColumn: {
    flex: 1,
    minWidth: '120px',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--border)',
  },
  dayHeader: {
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Playfair Display', serif",
    fontSize: '0.85rem',
    color: 'var(--gold)',
    letterSpacing: '0.06em',
    borderBottom: '2px solid var(--crimson)',
    flexShrink: 0,
  },
  dayGrid: {
    display: 'grid',
    gridTemplateRows: `repeat(${ALL_TIMES.length}, ${ROW_HEIGHT}px)`,
    position: 'relative',
    flex: 1,
  },
  hourLine: {
    borderTop: '1px solid rgba(90,32,32,0.3)',
    pointerEvents: 'none' as const,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--white-dim)',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    display: 'inline-block',
  },
};