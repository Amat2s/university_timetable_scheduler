// Object types used throughout the project

export type Title = 'Dr' | 'Prof' | 'Mr' | 'Ms' | 'Mrs' | 'Fr';

export interface Lecturer {
    id: number
    title: Title
    first_name: string
    last_name: string
    // Availablility (TODO)
}

export interface Student {
    id: number
    title: Title
    first_name: string
    last_name: string
}

export interface Course {
    course_id: string
    name: string
    lecture: [number, number] // [hours, cap.]
    seminar: [number, number] // [hours, cap.]
    tutorials: Array<[number, number]> // [hours, cap.], array length = number of tutorial groups
}

export interface Subject {
    course: Course
    lecturer: Lecturer
    students: Student[]
}

