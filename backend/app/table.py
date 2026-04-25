import pandas as pd
import numpy as np

# Constants for now
DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

LECTURE_ROOMS = ['L1', 'L2']
TUTORIAL_ROOMS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']

LECTURE_SLOTS = [0, 1, 2, 3, 4, 5, 6] # Assuming 7 lecture slots per day, 2 hours each
TUTORIAL_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7] # Assuming 8 tutorial slots per day, 1 hour each

COURSES = [
    {
    'course_id': 'CS101',
    'lecturer': 'Dr. Smith',
    "tutorial_groups": ['G1', 'G2'],
    },
    {
    'course_id': 'CS102',
    'lecturer': 'Dr. Johnson',
    "tutorial_groups": ['G3', 'G4'],
    }
]

LECTURE_TO_TUT_SLOTS = {
    0: [0, 1], # Lecture slot 0 blocks tutorial slots 0 and 1
    1: [1, 2], # Lecture slot 1 blocks tutorial slots 1 and 2
    2: [2, 3], # Lecture slot 2 blocks tutorial slots 2 and 3
    3: [3, 4], # Lecture slot 3 blocks tutorial slots 3 and 4
    4: [4, 5], # Lecture slot 4 blocks tutorial slots 4 and 5
    5: [5, 6], # Lecture slot 5 blocks tutorial slots 5 and 6
    6: [6, 7], # Lecture slot 6 blocks tutorial slots 6 and 7
}

