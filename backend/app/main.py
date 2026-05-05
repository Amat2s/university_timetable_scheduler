from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from app.scheduler.solver import solve

app = FastAPI(title="University Timetable Scheduler")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXCEL_PATH = "app/scheduler/timetable.xlsx"


# Request models
class CoursePayload(BaseModel):
    course_id: str
    lecturer: str
    tutorial_groups: int = 1
    students: List[str] = []


class SolveRequest(BaseModel):
    courses: List[CoursePayload]


# Backwards-compatible GET endpoints (use hardcoded courses)
@app.get("/solve")
def run_solver_get():
    return solve()


@app.get("/solve/download")
def download_timetable_get():
    result = solve()

    if result["status"] == "infeasible":
        return {"error": "No valid timetable could be generated."}

    rows = result["timetable"]

    # Build the same DataFrame as before (kept for file layout)
    import pandas as pd

    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    LECTURE_ROOMS = ["L1", "L2"]
    TUTORIAL_ROOMS = ["T1", "T2", "T3", "T4", "T5", "T6"]
    all_rooms = LECTURE_ROOMS + TUTORIAL_ROOMS
    time_slots = [f"{h}:00–{h+1}:00" for h in range(9, 17)]

    columns = pd.MultiIndex.from_product([DAYS, all_rooms], names=["Day", "Room"])
    df = pd.DataFrame("", index=time_slots, columns=columns)
    df.index.name = "Time"

    for row in rows:
        day = row["day"]
        room = row["room"]
        time = row["time_slot"]
        timeFmt = f"{9 + time}:00–{10 + time}:00"
        timeFmtPlusOne = f"{10 + time}:00–{11 + time}:00"
        if (day, room) in df.columns:
            current = df.loc[timeFmt, (day, room)]
            df.loc[timeFmt, (day, room)] = (
                row["event"] if current == "" else current + "\n" + row["event"]
            )
            if row["type"] == "lecture":
                df.loc[timeFmtPlusOne, (day, room)] = (
                    row["event"]
                    if df.loc[timeFmtPlusOne, (day, room)] == ""
                    else df.loc[timeFmtPlusOne, (day, room)] + "\n" + row["event"]
                )

    df.to_excel(EXCEL_PATH, sheet_name="Timetable")
    return FileResponse(
        path=EXCEL_PATH,
        filename="timetable.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# New POST endpoint: accept user-provided courses
@app.post("/solve")
def run_solver(payload: SolveRequest):
    # Convert Pydantic models to plain dicts for the solver
    courses = [c.dict() for c in payload.courses]
    return solve(courses_payload=courses)


# New POST download endpoint
@app.post("/solve/download")
def download_timetable(payload: SolveRequest):
    courses = [c.dict() for c in payload.courses]
    result = solve(courses_payload=courses)

    if result["status"] == "infeasible":
        return {"error": "No valid timetable could be generated."}

    rows = result["timetable"]

    import pandas as pd

    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    LECTURE_ROOMS = ["L1", "L2"]
    TUTORIAL_ROOMS = ["T1", "T2", "T3", "T4", "T5", "T6"]
    all_rooms = LECTURE_ROOMS + TUTORIAL_ROOMS
    time_slots = [f"{h}:00–{h+1}:00" for h in range(9, 17)]

    columns = pd.MultiIndex.from_product([DAYS, all_rooms], names=["Day", "Room"])
    df = pd.DataFrame("", index=time_slots, columns=columns)
    df.index.name = "Time"

    for row in rows:
        day = row["day"]
        room = row["room"]
        time = row["time_slot"]
        timeFmt = f"{9 + time}:00–{10 + time}:00"
        timeFmtPlusOne = f"{10 + time}:00–{11 + time}:00"
        if (day, room) in df.columns:
            current = df.loc[timeFmt, (day, room)]
            df.loc[timeFmt, (day, room)] = (
                row["event"] if current == "" else current + "\n" + row["event"]
            )
            if row["type"] == "lecture":
                df.loc[timeFmtPlusOne, (day, room)] = (
                    row["event"]
                    if df.loc[timeFmtPlusOne, (day, room)] == ""
                    else df.loc[timeFmtPlusOne, (day, room)] + "\n" + row["event"]
                )

    df.to_excel(EXCEL_PATH, sheet_name="Timetable")
    return FileResponse(
        path=EXCEL_PATH,
        filename="timetable.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
