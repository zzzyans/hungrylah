from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}

# Add more endpoints as needed
@app.get("/restaurants")
async def get_restaurants():
    # Example data - replace with your actual data
    return [
        {
            "id": 1,
            "name": "Restaurant 1",
            "cuisine": "Italian",
            "rating": 4.5
        },
        {
            "id": 2,
            "name": "Restaurant 2",
            "cuisine": "Japanese",
            "rating": 4.7
        }
    ] 