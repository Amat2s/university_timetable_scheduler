import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export interface CoursePayload {
  course_id: string
  lecturer: string
  tutorial_groups: number
  students: string[]
}

export interface SolveRequest {
  courses: CoursePayload[]
}

export interface TimetableEntry {
  time_slot: number
  time_start: string
  time_end: string
  day: string
  room: string
  event: string
  type: 'lecture' | 'tutorial'
}

export interface SolverResponse {
  status: 'success' | 'infeasible'
  timetable: TimetableEntry[]
}

export const solverApi = {
  // Send the full user-created course payload to the backend.
  // The backend will use this data instead of hardcoded courses.
  solveTimetable: async (payload: SolveRequest): Promise<SolverResponse> => {
    const response = await axios.post<SolverResponse>(`${API_BASE}/solve`, payload)
    return response.data
  },

  // Download the generated timetable as an Excel file.
  // This uses the same request payload so the file matches the current solve.
  downloadTimetable: async (payload: SolveRequest): Promise<void> => {
    const response = await axios.post(`${API_BASE}/solve/download`, payload, {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'timetable.xlsx')
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}