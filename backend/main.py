from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from recommendation import train_recommendation_model, get_recommendations_for_user, initialize_firebase

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
async def get_recommendations(user_id: str):
    algo = model_cache.get("algo")
    trainset = model_cache.get("trainset")

    if not algo or not trainset:
        raise HTTPException(status_code=503, detail="Recommendation service is currently unavailable.")

    try:
        # Check if the user has any ratings in our training set
        trainset.to_inner_uid(user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"No ratings found for user {user_id}. Cannot generate personalized recommendations.")

    recommended_ids = get_recommendations_for_user(user_id, algo, trainset, n=10)
    
    # Fetch full restaurant details from Firestore for the recommended IDs
    db = initialize_firebase()
    recommended_restaurants = []
    for restaurant_id in recommended_ids:
        doc_ref = db.collection('restaurants').document(restaurant_id)
        doc = doc_ref.get()
        if doc.exists:
            recommended_restaurants.append({"id": doc.id, **doc.to_dict()})
            
    return {"recommendations": recommended_restaurants}