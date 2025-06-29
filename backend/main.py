from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from recommendation import train_recommendation_model, get_recommendations_for_user, initialize_firebase, get_hybrid_recommendations

app = FastAPI()

# Enable CORS for all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache for the trained model
model_cache = {
    "algo": None,
    "trainset": None
}

@app.on_event("startup")
def startup_event():
    """Train the model when the application starts."""
    print("Training recommendation model on startup...")
    model_cache["algo"], model_cache["trainset"] = train_recommendation_model()
    if model_cache["algo"] is None:
        print("Warning: Model could not be trained. Recommendations will be unavailable.")

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}

@app.get("/recommendations/{user_id}")
async def get_recommendations(user_id: str, filter: str = Query("All")):
    algo = model_cache.get("algo")
    trainset = model_cache.get("trainset")
    db = initialize_firebase()

    if not algo or not trainset:
        raise HTTPException(status_code=503, detail="Recommendation service is currently unavailable.")

    recommended_restaurants = get_hybrid_recommendations(user_id, algo, trainset, db, n=10, threshold=3, filter=filter)
    return {"recommendations": recommended_restaurants}