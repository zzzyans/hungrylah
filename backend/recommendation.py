import pandas as pd
from surprise import SVD, Dataset, Reader
import firebase_admin
from firebase_admin import credentials, firestore

def initialize_firebase():
    """Initializes the Firebase Admin SDK if not already done."""
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    return firestore.client()

def get_all_reviews_as_dataframe(db):
    """Fetches all reviews from Firestore and returns them as a Pandas DataFrame."""
    reviews_ref = db.collection('reviews')
    docs = reviews_ref.stream()
    
    reviews_list = []
    for doc in docs:
        review_data = doc.to_dict()
        reviews_list.append({
            'userID': review_data.get('userId'),
            'itemID': review_data.get('restaurantId'),
            'rating': review_data.get('rating')
        })
    
    return pd.DataFrame(reviews_list)

def train_recommendation_model():
    """
    Trains a recommendation model using the SVD algorithm on all reviews from Firestore.
    Returns the trained algorithm and the full training dataset.
    """
    db = initialize_firebase()
    df = get_all_reviews_as_dataframe(db)

    if df.empty:
        print("Warning: No reviews found. The recommendation model cannot be trained.")
        return None, None

    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df[['userID', 'itemID', 'rating']], reader)
    trainset = data.build_full_trainset()
    
    algo = SVD()
    algo.fit(trainset)
    
    print("Recommendation model trained successfully.")
    return algo, trainset

def get_recommendations_for_user(user_id, algo, trainset, n=10):
    """
    Generates top-N restaurant recommendations for a given user.
    """
    # Get a list of all item IDs
    all_item_raw_ids = [trainset.to_raw_iid(inner_id) for inner_id in trainset.all_items()]

    # Get items the user has already rated
    try:
        user_inner_id = trainset.to_inner_uid(user_id)
        rated_item_raw_ids = {trainset.to_raw_iid(inner_id) for (inner_id, _) in trainset.ur[user_inner_id]}
    except ValueError:
        # User does not exist in the trainset (no ratings)
        rated_item_raw_ids = set()

    # Get items to predict
    items_to_predict = set(all_item_raw_ids) - rated_item_raw_ids
    
    # Predict ratings for the unrated items
    predictions = [algo.predict(user_id, item_id) for item_id in items_to_predict]
    
    # Sort the predictions by estimated rating
    predictions.sort(key=lambda x: x.est, reverse=True)
    
    # Get the top N recommended item IDs
    top_n_recs = [pred.iid for pred in predictions[:n]]
    
    return top_n_recs 

def get_user_review_count(db, user_id):
    """Returns the number of reviews a user has made."""
    reviews_ref = db.collection('reviews').where('userId', '==', user_id)
    return len(list(reviews_ref.stream()))

def get_user_preferences(db, user_id):
    """Fetches user preferences from Firestore."""
    doc_ref = db.collection('userPreferences').document(user_id)
    doc = doc_ref.get()
    if not doc.exists:
        return None
    return doc.to_dict()

def get_all_restaurants(db):
    """Fetches all restaurants from Firestore as a list of dicts."""
    docs = db.collection('restaurants').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

def compute_content_score(restaurant, prefs):
    score = 0
    if not prefs or not restaurant:
        return score
    # Cuisine match
    if 'cuisines' in prefs and restaurant.get('cuisineType') in prefs['cuisines']:
        score += 2
    # Price match
    try:
        user_price = int(prefs.get('priceRange', 0))
        rest_price = int(restaurant.get('priceLevel', 0))
        if rest_price == user_price:
            score += 1
        elif abs(rest_price - user_price) == 1:
            score += 0.5
    except Exception:
        pass
    return score

def apply_filter(restaurants, filter):
    if filter == "Highly Rated":
        return [r for r in restaurants if r.get('rating', 0) >= 4.5]
    return restaurants

def get_content_based_recommendations(user_id, db, n=10, filter="All"):
    prefs = get_user_preferences(db, user_id)
    if not prefs:
        return []
    restaurants = get_all_restaurants(db)
    scored = []
    for r in restaurants:
        score = compute_content_score(r, prefs)
        scored.append({**r, 'score': score})  # include all, even score 0
    scored.sort(key=lambda x: x['score'], reverse=True)
    filtered = apply_filter(scored, filter)
    return filtered  # no limit

def get_hybrid_recommendations(user_id, algo, trainset, db, n=10, threshold=3, filter="All"):
    review_count = get_user_review_count(db, user_id)
    if review_count < threshold:
        return get_content_based_recommendations(user_id, db, n, filter)
    try:
        trainset.to_inner_uid(user_id)
    except ValueError:
        return get_content_based_recommendations(user_id, db, n, filter)
    # Collaborative filtering: score all restaurants
    restaurants = get_all_restaurants(db)
    predictions = []
    for r in restaurants:
        pred = algo.predict(user_id, r['id'])
        predictions.append({**r, 'predicted_rating': pred.est})
    predictions.sort(key=lambda x: x['predicted_rating'], reverse=True)
    filtered = apply_filter(predictions, filter)
    return filtered  # no limit 