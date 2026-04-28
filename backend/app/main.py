from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
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

@app.get("/solve")
def run_solver():
    """Run the solver and return the timetable as JSON."""
    return solve()

@app.get("/solve/download")
def download_timetable():
    """Run the solver and return the timetable as an Excel file."""
    result = solve()

    if result["status"] == "infeasible":
        return {"error": "No valid timetable could be generated."}

    rows = result["timetable"]

    # Build the same DataFrame as before
    DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    LECTURE_ROOMS = ['L1', 'L2']
    TUTORIAL_ROOMS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
    all_rooms = LECTURE_ROOMS + TUTORIAL_ROOMS
    time_slots = [f"{h}:00–{h+1}:00" for h in range(9, 17)]

    columns = pd.MultiIndex.from_product([DAYS, all_rooms], names=["Day", "Room"])
    df = pd.DataFrame("", index=time_slots, columns=columns)
    df.index.name = "Time"

    for row in rows:
        day  = row["day"]
        room = row["room"]
        time = row["time_slot"]
        timeFmt = f"{9 + time}:00–{10 + time}:00"
        timeFmtPlusOne = f"{10 + time}:00–{11 + time}:00"
        if (day, room) in df.columns:
            current = df.loc[timeFmt, (day, room)]
            df.loc[timeFmt, (day, room)] = row["event"] if current == "" else current + "\n" + row["event"]
            if row["type"] == "lecture":
                df.loc[timeFmtPlusOne, (day, room)] = row["event"] if df.loc[timeFmtPlusOne, (day, room)] == "" else df.loc[timeFmtPlusOne, (day, room)] + "\n" + row["event"]

    df.to_excel(EXCEL_PATH, sheet_name="Timetable")
    return FileResponse(
        path=EXCEL_PATH,
        filename="timetable.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )