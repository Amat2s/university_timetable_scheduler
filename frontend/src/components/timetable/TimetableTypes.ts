export type TimetableEntry = {
  time_slot: number;
  time_start: string;
  time_end: string;
  day: string;
  room: string;
  event: string | number;
  tutorial: number;
  type: 'lecture' | 'tutorial';
};

export type TimetableProps = {
  timetable: TimetableEntry[];
};