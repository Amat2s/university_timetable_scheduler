from ortools.sat.python import cp_model
import pandas as pd

DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

LECTURE_ROOMS = ['L1', 'L2']
TUTORIAL_ROOMS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']

LECTURE_SLOTS = [0, 1, 2, 3] # Assuming 4 lecture slots per day, 2 hours each
TUTORIAL_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7] # Assuming 8 tutorial slots per day, 1 hour each

COURSES = [
    # ── Theology ───────────────────────────────────────────────────────────
    {"course_id": "THEO101", "lecturer": "Dr_Augustine", "tutorial_groups": 3},
    {"course_id": "THEO201", "lecturer": "Dr_Augustine", "tutorial_groups": 3},
    {"course_id": "THEO301", "lecturer": "Dr_Augustine", "tutorial_groups": 3},

    # ── Literature ─────────────────────────────────────────────────────────
    {"course_id": "LIT101",  "lecturer": "Dr_Shelley",   "tutorial_groups": 3},
    {"course_id": "LIT201",  "lecturer": "Dr_Shelley",   "tutorial_groups": 3},
    {"course_id": "LIT301",  "lecturer": "Dr_Shelley",   "tutorial_groups": 3},

    # ── History ────────────────────────────────────────────────────────────
    {"course_id": "HIS101",  "lecturer": "Dr_Herodotus", "tutorial_groups": 3},
    {"course_id": "HIS201",  "lecturer": "Dr_Herodotus", "tutorial_groups": 3},
    {"course_id": "HIS301",  "lecturer": "Dr_Herodotus", "tutorial_groups": 3},

    # ── Philosophy ─────────────────────────────────────────────────────────
    {"course_id": "PHI101",  "lecturer": "Dr_Socrates",  "tutorial_groups": 3},
    {"course_id": "PHI201",  "lecturer": "Dr_Socrates",  "tutorial_groups": 3},
    {"course_id": "PHI301",  "lecturer": "Dr_Socrates",  "tutorial_groups": 3},
]

LECTURE_TO_TUT_SLOTS = {
    0: [0, 1], # Lecture slot 0 blocks tutorial slots 0 and 1
    1: [2, 3], # Lecture slot 1 blocks tutorial slots 2 and 3
    2: [4, 5], # Lecture slot 2 blocks tutorial slots 4 and 5
    3: [6, 7], # Lecture slot 3 blocks tutorial slots 6 and 7
}

def get_tut_groups(course):
    return [f"{course['course_id']}_T{i+1}" for i in range(course['tutorial_groups'])]

def solve():
    model = cp_model.CpModel()

    lecture_vars = {}
    for course in COURSES:
        for day in DAYS:
            for slot in LECTURE_SLOTS:
                for room in LECTURE_ROOMS:
                    key = (course['course_id'], day, slot, room)
                    lecture_vars[key] = model.new_bool_var(f"lec_{key}")
    
    tutorial_vars = {}
    for course in COURSES:
        for tut_group in get_tut_groups(course):
            for day in DAYS:
                for slot in TUTORIAL_SLOTS:
                    for room in TUTORIAL_ROOMS:
                        key = (course['course_id'], tut_group, day, slot, room)
                        tutorial_vars[key] = model.new_bool_var(f"tut_{key}")
    
    # Constraints
    for course in COURSES:
        # Each course must have exactly one lecture
        model.add_exactly_one(
            lecture_vars[(course['course_id'], day, slot, room)] 
            for day in DAYS 
            for slot in LECTURE_SLOTS 
            for room in LECTURE_ROOMS
        )

    for course in COURSES:
        for tut_group in get_tut_groups(course):
            # Each tutorial group must have exactly one tutorial
            model.add_exactly_one(
                tutorial_vars[(course['course_id'], tut_group, day, slot, room)] 
                for day in DAYS 
                for slot in TUTORIAL_SLOTS 
                for room in TUTORIAL_ROOMS
            )
    
    # No lecture room can be double booked
    for day in DAYS:
        for slot in LECTURE_SLOTS:
            for room in LECTURE_ROOMS:
                model.add_at_most_one(
                    lecture_vars[(course['course_id'], day, slot, room)] 
                    for course in COURSES
                )

    # No tutorial room can be double booked
    for day in DAYS:
        for slot in TUTORIAL_SLOTS:
            for room in TUTORIAL_ROOMS:
                model.add_at_most_one(
                    tutorial_vars[(course['course_id'], tut_group, day, slot, room)] 
                    for course in COURSES 
                    for tut_group in get_tut_groups(course)
                )

    # No lecturer clash (lecture blocks tutorial slots)
    for day in DAYS:
        for course in COURSES:
            lecturer = course['lecturer']
            same_lecturer_courses = [c for c in COURSES if c['lecturer'] == lecturer]
            for slot in LECTURE_SLOTS:
                model.add_at_most_one(
                    lecture_vars[(c['course_id'], day, slot, room)]
                    for c in same_lecturer_courses
                    for room in LECTURE_ROOMS
                )
                blocked_tut_slots = LECTURE_TO_TUT_SLOTS[slot]
                for tut_slot in blocked_tut_slots:
                    lec_vars = [
                        lecture_vars[(c['course_id'], day, slot, room)] 
                        for c in same_lecturer_courses 
                        for room in LECTURE_ROOMS
                    ]
                    tut_vars = [
                        tutorial_vars[(c['course_id'], tut_group, day, tut_slot, room)] 
                        for c in same_lecturer_courses 
                        for tut_group in get_tut_groups(c)
                        for room in TUTORIAL_ROOMS
                    ]
                    for lec_var in lec_vars:
                        for tut_var in tut_vars:
                            model.add(lec_var + tut_var <= 1)
    
    
    for course in COURSES:
        for group in get_tut_groups(course):

            # Each tutorial group must be scheduled exactly once
            model.add_exactly_one(
                tutorial_vars[(course['course_id'], group, day, slot, room)] 
                for day in DAYS 
                for slot in TUTORIAL_SLOTS 
                for room in TUTORIAL_ROOMS
            )

            # Tut group can't attend tut if lecture is scheduled at the same time
            for day in DAYS:
                for lec_slot in LECTURE_SLOTS:
                    blocked_tut_slots = LECTURE_TO_TUT_SLOTS[lec_slot]
                    for tut_slot in blocked_tut_slots:
                        for lec_room in LECTURE_ROOMS:
                            for tut_room in TUTORIAL_ROOMS:
                                model.add(
                                    lecture_vars[(course['course_id'], day, lec_slot, lec_room)] + 
                                    tutorial_vars[(course['course_id'], group, day, tut_slot, tut_room)] <= 1
                                )
                # No tut group can attend two tuts at the same time
                for tut_slot in TUTORIAL_SLOTS:
                    model.add_at_most_one(
                        tutorial_vars[(course['course_id'], group, day, slot, room)] 
                        for room in TUTORIAL_ROOMS
                    )
                
            

    # Solve the model
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    print(f"Solver status: {solver.StatusName(status)}")

    if status in (cp_model.FEASIBLE, cp_model.OPTIMAL):
    
        # ── Lectures ──────────────────────────────────────────────────────────
        lecture_rows = []
        for (course_id, day, slot, room), var in lecture_vars.items():
            if solver.value(var):
                lecture_rows.append({
                    "Course":   course_id,
                    "Day":      day,
                    "Start":    f"{slot * 2 + 9}:00",
                    "End":      f"{slot * 2 + 11}:00",
                    "Room":     room,
                })

        # ── Tutorials ─────────────────────────────────────────────────────────
        tut_rows = []
        for (course_id, group, day, slot, room), var in tutorial_vars.items():
            if solver.value(var):
                tut_rows.append({
                    "Course":   course_id,
                    "Group":    group,
                    "Day":      day,
                    "Start":    f"{slot + 9}:00",
                    "End":      f"{slot + 10}:00",
                    "Room":     room,
                })

        df_lectures  = pd.DataFrame(lecture_rows).sort_values(["Day", "Start"])
        df_tutorials = pd.DataFrame(tut_rows).sort_values(["Day", "Course", "Start"])

        print("\n── Lectures ──────────────────────────────────────────")
        print(df_lectures.to_string(index=False))

        print("\n── Tutorials ─────────────────────────────────────────")
        print(df_tutorials.to_string(index=False))

    else:
        print("No solution found — check your constraints.")

if __name__ == "__main__":
    solve()
    