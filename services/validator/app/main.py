from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuración correcta de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todos los dominios, ajusta según producción
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

@app.post("/validate")
async def validate_endpoint(data: dict):
    # tu lógica aquí
    return {"resultado": "ok"}
