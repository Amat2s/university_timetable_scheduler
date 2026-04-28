import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export interface TimetableEntry {
  time_slot: number;
  time_start: string;
  time_end: string;
  day: string;
  room: string;
  event: string;
  type: 'lecture' | 'tutorial';
}

export interface SolverResponse {
  status: 'success' | 'infeasible';
  timetable: TimetableEntry[];
}

export const solverApi = {
  getSolve: async (): Promise<SolverResponse> => {
    const response = await axios.get<SolverResponse>(`${API_BASE}/solve`);
    return response.data;
  },

  downloadTimetable: async (): Promise<void> => {
    const response = await axios.get(`${API_BASE}/solve/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'timetable.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },
};
