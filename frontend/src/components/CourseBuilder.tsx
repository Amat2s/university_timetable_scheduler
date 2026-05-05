export interface CourseDraft {
  id: string
  course_id: string
  lecturer: string
  tutorial_groups: number
  studentsText: string
}

interface CourseBuilderProps {
  courses: CourseDraft[]
  onChange: (courses: CourseDraft[]) => void
}

// This helper gives each draft row a stable local id.
// That lets React update one row without confusing it with another row.
const makeLocalId = () => `course_${Math.random().toString(36).slice(2, 10)}`

// This is the empty row we use when the user first opens the page,
// or when they delete the last course in the list.
const createBlankCourse = (): CourseDraft => ({
  id: makeLocalId(),
  course_id: '',
  lecturer: '',
  tutorial_groups: 1,
  studentsText: '',
})

export function createInitialCourses(): CourseDraft[] {
  return [createBlankCourse()]
}

export function CourseBuilder({ courses, onChange }: CourseBuilderProps) {
  // Update a text field on one specific course row.
  const updateTextField = (
    id: string,
    field: 'course_id' | 'lecturer' | 'studentsText',
    value: string,
  ) => {
    onChange(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course,
      ),
    )
  }

  // Update the numeric tutorial-group field on one specific row.
  const updateNumberField = (id: string, value: number) => {
    onChange(
      courses.map((course) =>
        course.id === id
          ? { ...course, tutorial_groups: Number.isFinite(value) && value > 0 ? value : 1 }
          : course,
      ),
    )
  }

  // Add a brand-new blank course row to the form.
  const addCourse = () => {
    onChange([...courses, createBlankCourse()])
  }

  // Remove one course row.
  // If there is only one row left, reset it instead of leaving the form empty.
  const removeCourse = (id: string) => {
    if (courses.length === 1) {
      onChange([createBlankCourse()])
      return
    }

    onChange(courses.filter((course) => course.id !== id))
  }

  return (
    <div className="course-builder">
      <p className="builder-help">
        Each row becomes one course that the solver will receive. Use a comma-separated list for students.
      </p>

      <div className="course-list">
        {courses.map((course, index) => (
          <article key={course.id} className="course-card">
            <div className="course-card-header">
              <div>
                <h3>Course {index + 1}</h3>
                <p>Fill in the details for one solver input row.</p>
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => removeCourse(course.id)}
              >
                Remove
              </button>
            </div>

            <div className="course-grid">
              <label className="field">
                <span>Course code</span>
                <input
                  type="text"
                  value={course.course_id}
                  onChange={(event) => updateTextField(course.id, 'course_id', event.target.value)}
                  placeholder="THEO101"
                />
              </label>

              <label className="field">
                <span>Lecturer</span>
                <input
                  type="text"
                  value={course.lecturer}
                  onChange={(event) => updateTextField(course.id, 'lecturer', event.target.value)}
                  placeholder="Dr Augustine"
                />
              </label>

              <label className="field">
                <span>Tutorial groups</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={course.tutorial_groups}
                  onChange={(event) =>
                    updateNumberField(course.id, Number.parseInt(event.target.value, 10))
                  }
                />
              </label>
            </div>

            <label className="field field-wide">
              <span>Students</span>
              <textarea
                rows={4}
                value={course.studentsText}
                onChange={(event) => updateTextField(course.id, 'studentsText', event.target.value)}
                placeholder="Alice, Ben, Clara, David"
              />
            </label>
          </article>
        ))}
      </div>

      <div className="course-builder-footer">
        <button type="button" className="btn btn-secondary" onClick={addCourse}>
          Add another course
        </button>

        <p className="builder-note">
          Separate students with commas. The frontend will turn this text into an array before sending it to the backend.
        </p>
      </div>
    </div>
  )
}