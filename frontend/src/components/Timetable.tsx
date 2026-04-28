import type { TimetableEntry } from '../services/api';
import '../styles/Timetable.css';

interface TimetableProps {
  data: TimetableEntry[];
}

interface TimeSlot {
  label: string;
  slot: number | null;
  isLunch?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const LECTURE_ROOMS = ['L1', 'L2'];
const TUTORIAL_ROOMS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
const ALL_ROOMS = [...LECTURE_ROOMS, ...TUTORIAL_ROOMS];

const TIME_SLOTS: TimeSlot[] = [
  { label: '9:00–10:00', slot: 0 },
  { label: '10:00–11:00', slot: 1 },
  { label: '11:00–12:00', slot: 2 },
  { label: '12:00–1:30', slot: null, isLunch: true },
  { label: '1:30–2:30', slot: 3 },
  { label: '2:30–3:30', slot: 4 },
  { label: '3:30–4:30', slot: 5 },
  { label: '4:30–5:30', slot: 6 },
];

export function Timetable({ data }: TimetableProps) {
  // Build a map for quick lookup: (day, room, timeSlot) -> event
  const eventMap = new Map<string, TimetableEntry[]>();

  data.forEach((entry) => {
    const key = `${entry.day}_${entry.room}_${entry.time_slot}`;
    if (!eventMap.has(key)) {
      eventMap.set(key, []);
    }
    eventMap.get(key)!.push(entry);
  });

  const getEventsForCell = (day: string, room: string, timeSlot: number): TimetableEntry[] => {
    const key = `${day}_${room}_${timeSlot}`;
    return eventMap.get(key) || [];
  };

  const getCellClass = (events: TimetableEntry[]): string => {
    if (events.length === 0) return 'cell empty';
    return events[0].type === 'lecture' ? 'cell lecture' : 'cell tutorial';
  };

  // Track which cells are covered by rowspan from above
  const coveredCells = new Set<string>();

  const getCellKey = (day: string, room: string, timeSlot: number): string => {
    return `${day}_${room}_${timeSlot}`;
  };

  return (
    <div className="timetable-page">
      <div className="timetable-scroll">
      <table className="timetable">
        <thead>
          <tr>
            <th className="th-corner" rowSpan={2} />
            {DAYS.map((day) => (
              <th key={`day-${day}`} className="th-day-group" colSpan={ALL_ROOMS.length}>{day}</th>
            ))}
          </tr>
          <tr>
            {DAYS.map((day) =>
              ALL_ROOMS.map((room) => (
                <th key={`${day}-${room}-hdr`} className="th-room">{room}</th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((timeSlotInfo, index) => {
            if (timeSlotInfo.isLunch) {
              return (
                <tr key={index}>
                  <td className="td-time">
                    <span className="time-start">12:00</span>
                    <span className="time-end">1:30</span>
                  </td>
                  {DAYS.map((day) =>
                    ALL_ROOMS.map((room) => (
                      <td key={`${day}-${room}`} className={`td-cell blocked`}>{timeSlotInfo.label}</td>
                    ))
                  )}
                </tr>
              );
            }

            return (
              <tr key={index}>
                <td className="td-time">
                  {(() => {
                    const parts = timeSlotInfo.label.split('–');
                    return (
                      <>
                        <span className="time-start">{parts[0]}</span>
                        <span className="time-end">{parts[1]}</span>
                      </>
                    );
                  })()}
                </td>
                {DAYS.map((day) =>
                  ALL_ROOMS.map((room) => {
                    const cellKey = getCellKey(day, room, timeSlotInfo.slot!);

                    // Skip this cell if it's covered by a rowspan from above
                    if (coveredCells.has(cellKey)) {
                      return null;
                    }

                    const events = getEventsForCell(day, room, timeSlotInfo.slot!);
                    const isLecture = events.length > 0 && events[0].type === 'lecture';
                    const rowspan = isLecture ? 2 : 1;

                    // Mark the next row as covered if this is a lecture
                    if (isLecture && index + 1 < TIME_SLOTS.length && TIME_SLOTS[index + 1].slot !== null) {
                      coveredCells.add(getCellKey(day, room, TIME_SLOTS[index + 1].slot!));
                    }

                    // Determine course base for color mapping
                    const first = events[0];
                    let baseCourse = '';
                    if (first) {
                      baseCourse = first.type === 'lecture' ? first.event : first.event.split('_')[0];
                    }

                    // build color class index map (stable per render)
                    // simple deterministic mapping based on encountered course ids
                    const courseOrder: Record<string, number> = {};
                    let nextIdx = 0;
                    data.forEach((e) => {
                      const id = e.type === 'lecture' ? e.event : e.event.split('_')[0];
                      if (!(id in courseOrder)) {
                        courseOrder[id] = nextIdx++;
                      }
                    });

                    const colorIdx = baseCourse ? (courseOrder[baseCourse] % 12) : 0;
                    const colorClass = `color-${colorIdx}`;
                    const cellClass = `td-cell ${isLecture ? 'lec' : 'tut-a'} ${colorClass} ${events.length === 0 ? 'empty' : ''}`;

                    return (
                      <td key={`${day}-${room}`} className={cellClass} rowSpan={rowspan}>
                        {events.length > 0 && (
                          <div className="cell-event">
                            {events.map((event, idx) => (
                              <div key={idx}>
                                <div className="event-code">{event.event}</div>
                                <div className="event-type">{event.type === 'lecture' ? 'Lecture' : 'Tutorial'}</div>
                                <div className="event-lecturer">{event.type === 'lecture' ? '' : ''}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
