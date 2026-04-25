import pandas as pd
import numpy as np

class Course():
    def __init__(self, course_id, lecturer, students, tutorial_groups, lecture, tutorial):
        self.course_id = course_id
        self.lecturer = lecturer
        self.students = students
        self.tutorial_groups = tutorial_groups
        self.lecture = lecture
        self.tutorial = tutorial

class Lecturer():
    def __init__(self, name, courses):
        self.name = name
        self.courses = courses

class TutorialGroup():
    def __init__(self, group_id, course_id, lecturer):
        self.group_id = group_id
        self.course_id = course_id
        self.lecturer = lecturer

class Lecture():
    def __init__(self, course_id, lecturer, day, lecture_slot, lecture_room):
        self.course_id = course_id
        self.lecturer = lecturer
        self.day = day
        self.lecture_slot = lecture_slot
        self.lecture_room = lecture_room

class Tutorial():
    def __init__(self, course_id, lecturer, tutorial_group, day, tutorial_slot, tutorial_room):
        self.course_id = course_id
        self.lecturer = lecturer
        self.tutorial_group = tutorial_group
        self.day = day
        self.tutorial_slot = tutorial_slot
        self.tutorial_room = tutorial_room