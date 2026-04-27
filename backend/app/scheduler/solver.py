from ortools.sat.python import cp_model
import pandas as pd
import itertools
import random

YEAR_1_STUDENTS = [
    "Alice", "Ben", "Clara", "David", "Emma",
    "Finn", "Grace", "Henry", "Isla", "Jack",
    "Kate", "Liam", "Mia", "Noah", "Olivia",
    "Peter", "Quinn", "Rose", "Sam", "Tara",
]

YEAR_2_STUDENTS = [
    "Adam", "Bella", "Chris", "Diana", "Ethan",
    "Fiona", "George", "Hannah", "Ivan", "Julia",
    "Kevin", "Laura", "Mark", "Nina", "Oscar",
    "Paula", "Ryan", "Sofia", "Tom", "Uma",
]

YEAR_3_STUDENTS = [
    "Aaron", "Beth", "Carl", "Dora", "Eli",
    "Faith", "Glen", "Hope", "Ian", "Jane",
    "Kyle", "Luna", "Max", "Nora", "Owen",
    "Pam", "Reed", "Sara", "Todd", "Vera",
]

DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

LECTURE_ROOMS = ['L1', 'L2']
TUTORIAL_ROOMS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']

LECTURE_SLOTS = [0, 1, 2, 3, 4, 5, 6] # Assuming 7 lecture slots per day, 2 hours each
TUTORIAL_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7] # Assuming 8 tutorial slots per day, 1 hour each

LECTURE_TO_TUT_SLOTS = {
    0: [0, 1], # Lecture slot 0 blocks tutorial slots 0 and 1
    1: [1, 2], # Lecture slot 1 blocks tutorial slots 1 and 2
    2: [2, 3], # Lecture slot 2 blocks tutorial slots 2 and 3
    3: [3, 4], # Lecture slot 3 blocks tutorial slots 3 and 4
    4: [4, 5], # Lecture slot 4 blocks tutorial slots 4 and 5
    5: [5, 6], # Lecture slot 5 blocks tutorial slots 5 and 6
    6: [6, 7], # Lecture slot 6 blocks tutorial slots 6 and 7
}

LECTURE_TO_LECTURE_SLOTS = {
    0: [0, 1], # Lecture slot 0 blocks lecture slots 0 and 1
    1: [1, 2], # Lecture slot 1 blocks lecture slots 1 and 2
    2: [2, 3], # Lecture slot 2 blocks lecture slots 2 and 3
    3: [3, 4], # Lecture slot 3 blocks lecture slots 3 and 4
    4: [4, 5], # Lecture slot 4 blocks lecture slots 4 and 5
    5: [5, 6], # Lecture slot 5 blocks lecture slots 5 and 6
    6: [6],    # Lecture slot 6 blocks lecture slot 6
}

COURSES = [
    # ── Theology ───────────────────────────────────────────────────────────
    {"course_id": "THEO101", "lecturer": "Dr_Augustine", "tutorial_groups": 3, "students": YEAR_1_STUDENTS},
    {"course_id": "THEO201", "lecturer": "Dr_Augustine", "tutorial_groups": 3, "students": YEAR_2_STUDENTS},
    {"course_id": "THEO301", "lecturer": "Dr_Augustine", "tutorial_groups": 3, "students": YEAR_3_STUDENTS},

    # ── Literature ─────────────────────────────────────────────────────────
    {"course_id": "LIT101",  "lecturer": "Dr_Shelley",   "tutorial_groups": 3, "students": YEAR_1_STUDENTS},
    {"course_id": "LIT201",  "lecturer": "Dr_Shelley",   "tutorial_groups": 3, "students": YEAR_2_STUDENTS},
    {"course_id": "LIT301",  "lecturer": "Dr_Shelley",   "tutorial_groups": 3, "students": YEAR_3_STUDENTS},

    # ── History ────────────────────────────────────────────────────────────
    {"course_id": "HIS101",  "lecturer": "Dr_Herodotus", "tutorial_groups": 3, "students": YEAR_1_STUDENTS},
    {"course_id": "HIS201",  "lecturer": "Dr_Herodotus", "tutorial_groups": 3, "students": YEAR_2_STUDENTS},
    {"course_id": "HIS301",  "lecturer": "Dr_Herodotus", "tutorial_groups": 3, "students": YEAR_3_STUDENTS},

    # ── Philosophy ─────────────────────────────────────────────────────────
    {"course_id": "PHI101",  "lecturer": "Dr_Socrates",  "tutorial_groups": 3, "students": YEAR_1_STUDENTS},
    {"course_id": "PHI201",  "lecturer": "Dr_Socrates",  "tutorial_groups": 3, "students": YEAR_2_STUDENTS},
    {"course_id": "PHI301",  "lecturer": "Dr_Socrates",  "tutorial_groups": 3, "students": YEAR_3_STUDENTS},
]

def assign_students(course):
    groups = get_tut_groups(course)
    assignment = {}
    for student in course["students"]:
        assignment[student] = random.choice(groups)
    return assignment

def get_tut_groups(course):
    return [f"{course['course_id']}_T{i+1}" for i in range(course['tutorial_groups'])]

def solve():
    model = cp_model.CpModel()

    # Variables

    """
    VARIABLES:
    1. lecture_vars[(course_id, day, slot, room)] = 1 if course_id has a lecture at that time and place, 0 otherwise
    2. tutorial_vars[(course_id, tut_group, day, slot, room)] = 1 if tut_group of course_id has a tutorial at that time and place, 0 otherwise
    
    """

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

    student_assignments = {}
    for course in COURSES:
        student_assignments[course['course_id']] = assign_students(course)
    
    # Constraints

    """ 
    ALL CONSTRAINTS:

    ROOM CONSTRAINTS (RC):
    1. No room can host two events at the same time (lecture or tutorial) (S)
    2. Lectures take 2 hours, so they block two consecutive lecture slots in the same room (S)
    3. Each room can only hold a certain number of students (TODO: add capacity constraints)

    -LECTURER CONSTRAINTS (LC):
    1. No lecturer can teach two classes at the same time (lecture or tutorial) (S)
    
    -STUDENT CONSTRAINTS (SC):
    1. No student can attend two classes at the same time (lecture or tutorial) (S)
    
    -COURSE CONSTRAINTS (CC):
    1. Each course must have exactly one lecture per week (S)
    2. Each tutorial group must have exactly one tutorial per week (S)
    
    """

    # CC
    for course in COURSES:
        # CC1
        model.add_exactly_one(
            lecture_vars[(course['course_id'], day, slot, room)] 
            for day in DAYS 
            for slot in LECTURE_SLOTS 
            for room in LECTURE_ROOMS
        )

        # CC2
        for tut_group in get_tut_groups(course):
            # Each tutorial group must have exactly one tutorial
            model.add_exactly_one(
                tutorial_vars[(course['course_id'], tut_group, day, slot, room)] 
                for day in DAYS 
                for slot in TUTORIAL_SLOTS 
                for room in TUTORIAL_ROOMS
            )

    # LC1
    for day in DAYS:
        for slot in LECTURE_SLOTS:
            for lecturer in set(c['lecturer'] for c in COURSES):
                model.add_at_most_one(itertools.chain((
                    lecture_vars[(c['course_id'], day, lec_slot, room)]
                    for c in COURSES if c['lecturer'] == lecturer
                    for lec_slot in LECTURE_TO_LECTURE_SLOTS[slot]
                    for room in LECTURE_ROOMS 
                    ), (
                    tutorial_vars[(c['course_id'], tut_group, day, tut_slot, room)]
                    for c in COURSES if c['lecturer'] == lecturer
                    for tut_group in get_tut_groups(c)
                    for tut_slot in LECTURE_TO_TUT_SLOTS[slot]
                    for room in TUTORIAL_ROOMS
                    ))
                )
    
    # SC1
    for student in YEAR_1_STUDENTS + YEAR_2_STUDENTS + YEAR_3_STUDENTS:
        for day in DAYS:
            for slot in LECTURE_SLOTS:
                model.add_at_most_one(itertools.chain((
                    lecture_vars[(c['course_id'], day, lec_slot, room)]
                    for c in COURSES if student in c['students']
                    for lec_slot in LECTURE_TO_LECTURE_SLOTS[slot]
                    for room in LECTURE_ROOMS 
                    ), (
                    tutorial_vars[(c['course_id'], student_assignments[c['course_id']][student], day, tut_slot, room)]
                    for c in COURSES if student in c['students']
                    for tut_slot in LECTURE_TO_TUT_SLOTS[slot]
                    for room in TUTORIAL_ROOMS
                    ))
                )
    
    # RC1 for lectures and RC2
    for day in DAYS:
        for slot in LECTURE_SLOTS:
            blocked_lec_slots = LECTURE_TO_LECTURE_SLOTS[slot]
            for room in LECTURE_ROOMS:
                model.add_at_most_one(
                    lecture_vars[(course['course_id'], day, blocked_lec_slot, room)] 
                    for blocked_lec_slot in blocked_lec_slots
                    for course in COURSES
                )

    # RC1 for tutorials
    for day in DAYS:
        for slot in TUTORIAL_SLOTS:
            for room in TUTORIAL_ROOMS:
                model.add_at_most_one(
                    tutorial_vars[(course['course_id'], tut_group, day, slot, room)] 
                    for course in COURSES 
                    for tut_group in get_tut_groups(course)
                )
             

    # Solve the model
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    print(f"Solver status: {solver.StatusName(status)}")

    if status in (cp_model.FEASIBLE, cp_model.OPTIMAL):

    # ── Collect results ────────────────────────────────────────────────────
        lecture_rows = []
        for (course_id, day, slot, room), var in lecture_vars.items():
            if solver.value(var):
                lecture_rows.append({
                    "Time":  slot,
                    "Day":   day,
                    "Room":  room,
                    "Event": f"{course_id}",
                    "Lec": True,
                })

        tut_rows = []
        for (course_id, group, day, slot, room), var in tutorial_vars.items():
            if solver.value(var):
                tut_rows.append({
                    "Time":  slot,
                    "Day":   day,
                    "Room":  room,
                    "Event": f"{group}",
                    "Lec": False,
                })

        all_rows = lecture_rows + tut_rows

        # ── Build multi-column table ───────────────────────────────────────────
        all_rooms = LECTURE_ROOMS + TUTORIAL_ROOMS
        time_slots = (
            [f"{h}:00–{h+1}:00" for h in range(9, 17)]
        )

        # Build multi-index columns: (Day, Room)
        columns = pd.MultiIndex.from_product([DAYS, all_rooms], names=["Day", "Room"])
        df = pd.DataFrame("", index=time_slots, columns=columns)
        df.index.name = "Time"

        for row in all_rows:
            day  = row["Day"]
            room = row["Room"]
            time = row["Time"]
            timeFmt = f"{9 + time}:00–{10 + time}:00"
            timeFmtPlusOne = f"{10 + time}:00–{11 + time}:00"
            if (day, room) in df.columns:
                current = df.loc[timeFmt, (day, room)]
                df.loc[timeFmt, (day, room)] = row["Event"] if current == "" else current + "\n" + row["Event"]
                if row["Lec"]:
                    df.loc[timeFmtPlusOne, (day, room)] = row['Event'] if df.loc[timeFmtPlusOne, (day, room)] == "" else df.loc[timeFmtPlusOne, (day, room)] + "\n" + row['Event']

        # ── Print ──────────────────────────────────────────────────────────────
        pd.set_option("display.max_columns", None)
        pd.set_option("display.width", 100)
        pd.set_option("display.max_colwidth", 30)

        df.to_excel("backend/app/scheduler/timetable.xlsx", sheet_name="Timetable")
        print("Timetable saved to timetable.xlsx")

    else:
        print("No solution found — check your constraints.")

if __name__ == "__main__":
    solve()
    