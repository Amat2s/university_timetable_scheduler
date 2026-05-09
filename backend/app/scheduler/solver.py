from ortools.sat.python import cp_model
import pandas as pd
import itertools
import random
from typing import List, Dict, Optional

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

LECTURE_ROOMS = ["L1", "L2"]
TUTORIAL_ROOMS = ["T1", "T2", "T3", "T4", "T5", "T6"]

LECTURE_SLOTS = [0, 1, 2, 3, 4, 5]  # Assuming 6 lecture slots per day, 2 hours each
TUTORIAL_SLOTS = [0, 1, 2, 3, 4, 5, 6]  # Assuming 7 tutorial slots per day, 1 hour each

LECTURE_TO_TUT_SLOTS = {
    0: [0, 1],  # Lecture slot 0 blocks tutorial slots 0 and 1
    1: [1, 2],  # Lecture slot 1 blocks tutorial slots 1 and 2
    2: [2, 3],  # Lecture slot 2 blocks tutorial slots 2 and 3
    3: [3, 4],  # Lecture slot 3 blocks tutorial slots 3 and 4
    4: [4, 5],  # Lecture slot 4 blocks tutorial slots 4 and 5
    5: [5, 6],  # Lecture slot 5 blocks tutorial slots 5 and 6
}

LECTURE_TO_LECTURE_SLOTS = {
    0: [0, 1],  # Lecture slot 0 blocks lecture slots 0 and 1
    1: [1, 2],  # Lecture slot 1 blocks lecture slots 1 and 2
    2: [2, 3],  # Lecture slot 2 blocks lecture slots 2 and 3
    3: [3, 4],  # Lecture slot 3 blocks lecture slots 3 and 4
    4: [4, 5],  # Lecture slot 4 blocks lecture slots 4 and 5
    5: [5],  # Lecture slot 5 blocks lecture slot 5
}


def get_tut_groups(course: Dict) -> List[int]:
    return range(len(course["course"].get("tutorials", [])))


def assign_students(course: Dict) -> Dict[str, str]:
    groups = get_tut_groups(course)
    assignment = {}
    for student in course.get("students", []):
        assignment[student] = random.choice(groups) if groups else None
    return assignment


def solve(courses_payload: Optional[List[Dict]] = None) -> Dict:
    """
    Solve timetable.

    If `courses_payload` is provided, it should be a list of dicts with keys:
        - course (dict with keys: course_id (str), lecture (tuple[int, int]), seminar (tuple[int, int]), tutorials (list of tuple[int, int]))
        - lecturer (int)
        - students (int list)
    """

    # print(courses_payload)

    courses = courses_payload

    all_students = []
    for c in courses:
        for s in c.get("students", []):
            if s not in all_students:
                all_students.append(s)

    model = cp_model.CpModel()

    # Variables

    """
    VARIABLES:
    1. lecture_vars[(course_id, day, slot, room)] = 1 if course_id has a lecture at that time and place, 0 otherwise
    2. tutorial_vars[(course_id, tut_group, day, slot, room)] = 1 if tut_group of course_id has a tutorial at that time and place, 0 otherwise
    
    """

    lecture_vars = {}
    for course in courses:
        for day in DAYS:
            for slot in LECTURE_SLOTS:
                for room in LECTURE_ROOMS:
                    key = (course["course"]["course_id"], day, slot, room)
                    lecture_vars[key] = model.new_bool_var(f"lec_{key}")

    tutorial_vars = {}
    for course in courses:
        for tut_group in get_tut_groups(course):
            for day in DAYS:
                for slot in TUTORIAL_SLOTS:
                    for room in TUTORIAL_ROOMS:
                        key = (
                            course["course"]["course_id"],
                            tut_group,
                            day,
                            slot,
                            room,
                        )
                        tutorial_vars[key] = model.new_bool_var(f"tut_{key}")

    student_assignments = {}
    for course in courses:
        student_assignments[course["course"]["course_id"]] = assign_students(course)

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
    3. Lectures cannot start in slot 2, for lunch break ()
    
    """

    # CC12
    for course in courses:
        # CC1
        model.add_exactly_one(
            lecture_vars[(course["course"]["course_id"], day, slot, room)]
            for day in DAYS
            for slot in LECTURE_SLOTS
            for room in LECTURE_ROOMS
        )

        # CC2
        for tut_group in get_tut_groups(course):
            # Each tutorial group must have exactly one tutorial
            model.add_exactly_one(
                tutorial_vars[
                    (course["course"]["course_id"], tut_group, day, slot, room)
                ]
                for day in DAYS
                for slot in TUTORIAL_SLOTS
                for room in TUTORIAL_ROOMS
            )

    # CC3
    for course in courses:
        for day in DAYS:
            for room in LECTURE_ROOMS:
                model.add(
                    lecture_vars[(course["course"]["course_id"], day, 2, room)] == 0
                )

    # LC1
    for day in DAYS:
        for slot in LECTURE_SLOTS:
            for lecturer in set(c["lecturer"] for c in courses):
                model.add_at_most_one(
                    itertools.chain(
                        (
                            lecture_vars[
                                (c["course"]["course_id"], day, lec_slot, room)
                            ]
                            for c in courses
                            if c["lecturer"] == lecturer
                            for lec_slot in LECTURE_TO_LECTURE_SLOTS[slot]
                            for room in LECTURE_ROOMS
                        ),
                        (
                            tutorial_vars[
                                (
                                    c["course"]["course_id"],
                                    tut_group,
                                    day,
                                    tut_slot,
                                    room,
                                )
                            ]
                            for c in courses
                            if c["lecturer"] == lecturer
                            for tut_group in get_tut_groups(c)
                            for tut_slot in LECTURE_TO_TUT_SLOTS[slot]
                            for room in TUTORIAL_ROOMS
                        ),
                    )
                )

    # SC1
    for student in all_students:
        for day in DAYS:
            for slot in LECTURE_SLOTS:
                model.add_at_most_one(
                    itertools.chain(
                        (
                            lecture_vars[
                                (c["course"]["course_id"], day, lec_slot, room)
                            ]
                            for c in courses
                            if student in c["students"]
                            for lec_slot in LECTURE_TO_LECTURE_SLOTS[slot]
                            for room in LECTURE_ROOMS
                        ),
                        (
                            tutorial_vars[
                                (
                                    c["course"]["course_id"],
                                    student_assignments[c["course"]["course_id"]][
                                        student
                                    ],
                                    day,
                                    tut_slot,
                                    room,
                                )
                            ]
                            for c in courses
                            if student in c["students"]
                            for tut_slot in LECTURE_TO_TUT_SLOTS[slot]
                            for room in TUTORIAL_ROOMS
                        ),
                    )
                )

    # RC1 for lectures and RC2
    for day in DAYS:
        for slot in LECTURE_SLOTS:
            blocked_lec_slots = LECTURE_TO_LECTURE_SLOTS[slot]
            for room in LECTURE_ROOMS:
                model.add_at_most_one(
                    lecture_vars[
                        (course["course"]["course_id"], day, blocked_lec_slot, room)
                    ]
                    for blocked_lec_slot in blocked_lec_slots
                    for course in courses
                )

    # RC1 for tutorials
    for day in DAYS:
        for slot in TUTORIAL_SLOTS:
            for room in TUTORIAL_ROOMS:
                model.add_at_most_one(
                    tutorial_vars[
                        (course["course"]["course_id"], tut_group, day, slot, room)
                    ]
                    for course in courses
                    for tut_group in get_tut_groups(course)
                )

    # Solve the model
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    print(f"Solver status: {solver.StatusName(status)}")

    if status in (cp_model.FEASIBLE, cp_model.OPTIMAL):
        lecture_rows = []
        for (course_id, day, slot, room), var in lecture_vars.items():
            if solver.value(var):
                lecture_rows.append(
                    {
                        "time_slot": slot,
                        "time_start": f"{9 + slot}:00",
                        "time_end": f"{11 + slot}:00",
                        "day": day,
                        "room": room,
                        "event": course_id,
                        "tutorial": None,
                        "type": "lecture",
                    }
                )

        tut_rows = []
        for (course_id, group, day, slot, room), var in tutorial_vars.items():
            if solver.value(var):
                tut_rows.append(
                    {
                        "time_slot": slot,
                        "time_start": f"{9 + slot}:00",
                        "time_end": f"{10 + slot}:00",
                        "day": day,
                        "room": room,
                        "event": course_id,
                        "tutorial": group,
                        "type": "tutorial",
                    }
                )

        return {"status": "success", "timetable": lecture_rows + tut_rows}

    else:
        return {"status": "infeasible", "timetable": []}


if __name__ == "__main__":
    solve()
