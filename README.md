# TrafficX: Smart Traffic Management for Urban Congestion

A web application that turns traffic images into adaptive signal-timing recommendations. Two YOLOv8 models detect vehicles and ambulances, simple explainable rules estimate congestion and divide the signal cycle, and an emergency vehicle gets priority green time. Results are stored in Supabase and shown on a dashboard.

## Features
- Secure login with Supabase Auth and a role check from the `profiles` table
- One traffic image per lane (north, south, east, west) as the input
- Vehicle detection and classification (car, two-wheeler, bus, truck) with YOLOv8
- Emergency vehicle (ambulance) detection with a separate YOLOv8 model
- Density and congestion level per lane (Low, Medium, High)
- Adaptive green time per lane, with a 60 s priority green for an emergency lane
- Every analysis stored in PostgreSQL (one row per lane)
- Dashboard, junction status, analytics and a baseline congestion forecast with history

## How it works
```
Lane images → validation → YOLOv8 detection (general + emergency models)
            → density and congestion level → emergency check
            → signal timing (10 s minimum + proportional share of a 120 s cycle,
              or 60 s priority for the emergency lane)
            → stored in Supabase → shown on the dashboard
```

| Step | Method |
|---|---|
| Detection | YOLOv8s fine-tuned by transfer learning on public datasets |
| Density | detections ÷ 20 (lane capacity) |
| Congestion | below 0.3 Low, below 0.6 Medium, otherwise High |
| Green time | 10 s minimum per lane, rest of the 120 s cycle shared in proportion to counts (largest remainder method) |
| Emergency priority | lane with an ambulance gets 60 s, the others share the remaining 60 s |

## Tech stack
**Backend:** Python, FastAPI, Uvicorn, Ultralytics YOLOv8, PyTorch, OpenCV, Pydantic
**Frontend:** React, TypeScript, Vite, React Router
**Database and auth:** Supabase (PostgreSQL, Auth)
**Training:** Google Colab (T4 GPU), datasets from Roboflow Universe

## Project structure
```
backend/
├── main.py              # FastAPI app, CORS, startup DB check
├── api/                 # routes (upload, analyze, results, history, auth)
├── schemas/             # Pydantic request/response models
├── services/            # detection, congestion, signal timing, emergency priority
├── ml/                  # inference.py and model/ (best.pt, emergency.pt)
├── database/            # Supabase connection and queries
└── utils/

frontend/src/
├── components/          # Dashboard, Junctions, Analytics, Predictions, Login, ...
├── AnalysisContext.tsx  # shared analysis state
├── api.ts               # REST client
└── supabaseClient       # Supabase auth client
```

## Setup

### Backend
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1            # Windows PowerShell
python -m pip install -r requirements.txt
```
1. Create a Supabase project and run `database/traffic_results.sql` in the SQL editor.
2. Create a `.env` file in the backend folder with your Supabase URL and key (use the variable names defined in `database/connection.py`). Never commit this file.
3. Download the trained weights and place them in `ml/model/`: `best.pt` (vehicles) and `emergency.pt` (ambulances). Download link: **[ADD LINK]**

```bash
python -m uvicorn main:app --reload
```
API documentation: http://127.0.0.1:8000/docs

### Frontend
```bash
npm install
```
Create a `.env` file:
```
VITE_API_URL=http://127.0.0.1:8000
```
Add your Supabase URL and anon key as required by `supabaseClient`, then:
```bash
npm run dev
```

## API endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Health check |
| POST | `/upload` | Lane images → full analysis, stored and returned |
| POST | `/analyze` | Vehicle counts → analysis (no models needed) |
| GET | `/results/{upload_id}` | Stored rows of one analysis |
| GET | `/history` | Recent analyses |

## Model results
| Metric | Vehicle model | Ambulance model |
|---|---|---|
| Precision | 93.10 % | 76.95 % |
| Recall | 90.99 % | 75.61 % |
| mAP@50 | 95.08 % | 78.86 % |
| mAP@50-95 | 77.93 % | 42.94 % |

## Limitations and future work
- Image input only; video and live camera streams are planned, using YOLO tracking to avoid double counting
- The ambulance model was trained on a small single-source dataset without negative images and can give false alarms
- The system recommends timings but is not connected to signal hardware
- Lane capacity (20 vehicles) is an assumption, and all vehicle types count equally
- Planned: weighted density, LSTM forecasting on the stored history, retraining with local data, cloud deployment




