
from surprise import SVD, Reader, Dataset
from surprise.model_selection import train_test_split
from surprise import accuracy
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
import gc
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
import joblib
import h5py

#GET THE TRAINED FILE FROM COLAB
def loadData():
    cf_model = joblib.load('cf_model.joblib')
    tmdb_movieData_df = pd.read_csv('tmdb_movieData_df.csv')
    final_df = pd.read_csv('final_df.csv')
    feature_file = 'movie_features.h5'



#####################################################################################TRAINING OF MODEL#####################################################################################################################################
# final_df = pd.read_csv('/content/drive/MyDrive/MovieData/final_dataset.csv')
# tmdb_movieData_df = pd.read_csv('/content/drive/MyDrive/MovieData/TMDB_movie_dataset_v11.csv/TMDB_movie_dataset_v11.csv')
# tmdb_movieData_df = tmdb_movieData_df.drop(columns=['production_companies', 'poster_path', 'status', 'revenue', 'runtime', 'tagline', 'production_countries', 'spoken_languages', 'backdrop_path', 'homepage', 'imdb_id', 'original_language', 'overview'])


# import pandas as pd
# import numpy as np
# import datetime
# from sklearn.feature_extraction.text import HashingVectorizer
# import gc
# import h5py

# # Assume tmdb_movieData_df and final_df are already loaded

# # 1. Content Filtering
# tmdb_movieData_df = tmdb_movieData_df[tmdb_movieData_df['adult'] == False]

# # 2. Quality Consideration
# vote_count_percentile = np.percentile(tmdb_movieData_df['vote_count'], 70)

# def vectorized_quality_score(df):
#     mask = df['vote_count'] >= vote_count_percentile
#     scores = np.where(mask, 
#                       (df['vote_average'] * df['vote_count']) / (df['vote_count'] + 1000), 
#                       0)
#     return pd.Series(scores, index=df.index)

# tmdb_movieData_df['quality_score'] = vectorized_quality_score(tmdb_movieData_df)

# # 3. Recency Bias
# current_year = datetime.datetime.now().year

# def calculate_recency_score(release_date):
#     if pd.isnull(release_date):
#         return 0
#     try:
#         movie_year = pd.to_datetime(release_date).year
#         if movie_year > current_year:
#             return 1  # Assign highest recency score to future releases
#         elif movie_year == current_year:
#             return 0.99  # Assign very high score to current year releases
#         else:
#             return 1 / (current_year - movie_year + 1)
#     except:
#         print(f"Error processing date: {release_date}")
#         return 0  # Return 0 for any date we can't process

# tmdb_movieData_df['recency_score'] = tmdb_movieData_df['release_date'].apply(calculate_recency_score)

# # 4. Production Scale
# def estimate_production_scale(budget):
#     if pd.isnull(budget) or budget == 0:
#         return 0
#     return np.log(budget)

# tmdb_movieData_df['production_scale'] = tmdb_movieData_df['budget'].apply(estimate_production_scale)

# # 5. Genre Handling
# tmdb_movieData_df['genres'] = tmdb_movieData_df['genres'].fillna('').astype(str)

# # Print the first few rows to verify the changes
# print(tmdb_movieData_df[['quality_score', 'recency_score', 'production_scale', 'genres']].head())


# def preprocess_movies():
#     def process_movie(movie):
#         combined_features = f"{movie['genres']} {movie['keywords']}".strip()
#         return combined_features

#     vectorizer = HashingVectorizer(n_features=1000, stop_words='english')

#     batch_size = 1000
#     total_movies = len(tmdb_movieData_df)
#     feature_file = 'movie_features.h5'

#     with h5py.File(feature_file, 'w') as f:
#         feature_dataset = f.create_dataset('features', shape=(total_movies, 1000), dtype='float32')
        
#         for i in range(0, total_movies, batch_size):
#             batch = tmdb_movieData_df.iloc[i:i+batch_size]
#             batch_features = [process_movie(movie) for _, movie in batch.iterrows()]
#             batch_vectors = vectorizer.transform(batch_features)
#             feature_dataset[i:i+batch_size] = batch_vectors.toarray()
            
#             print(f"Processed and stored features for movies {i} to {i+batch_size}")
#             gc.collect()

#     print("Finished processing all movies")
#     return feature_file

# # Run this once to preprocess movies
# feature_file = preprocess_movies()
# print(f"Feature file created: {feature_file}")

# from sklearn.metrics.pairwise import cosine_similarity


#################################################################################################CONTENT BASED RECOMMENDING SYSTEM###############################################################################################################
# def content_based_recommendations(movie_id, n=20):
#     def compute_similarity(movie_features, all_features):
#         similarity = cosine_similarity(movie_features, all_features)[0]
#         return similarity

#     with h5py.File(feature_file, 'r') as f:
#         all_features = f['features'][:]
        
#     movie_index = tmdb_movieData_df.index[tmdb_movieData_df['id'] == movie_id][0]
#     movie_features = all_features[movie_index].reshape(1, -1)
    
#     similarities = compute_similarity(movie_features, all_features)
    
#     # Get top 2n similar movies to allow for diversity
#     similar_indices = similarities.argsort()[::-1][1:2*n+1]
#     similar_movies = tmdb_movieData_df.iloc[similar_indices].copy()
    
#     # Apply quality, recency, and production scale considerations
#     similar_movies['final_score'] = (
#         similar_movies['quality_score'] * 0.5 +
#         similar_movies['recency_score'] * 0.2 +
#         similar_movies['production_scale'] * 0.3
#     )
    
#     similar_movies = similar_movies.sort_values('final_score', ascending=False)
    
#     # Ensure diversity
#     # genres = set()
#     # diverse_recommendations = []
#     # for _, movie in similar_movies.iterrows():
#     #     movie_genres = set(movie['genres'].split())
#     #     if len(genres.intersection(movie_genres)) < 2:
#     #         diverse_recommendations.append(movie)
#     #         genres.update(movie_genres)
#     #     if len(diverse_recommendations) == n:
#     #         break
    
#     # return [movie['title'] for movie in diverse_recommendations]

#     #instead of ensuring diversity, we want movies as close as possible to the target movie. Why would we add more diverse movies? 
#     #This is why there are only 3 movies suggested when we try and ensure diversity
#     target_movie_genres = set(tmdb_movieData_df.loc[movie_index, 'genres'].split())
#     genres = target_movie_genres.copy()
#     narrow_recommendations = []
#     for _, movie in similar_movies.iterrows():
#         movie_genres = set(str(movie['genres']).split())

#         if len(genres.intersection(movie_genres)) >= 2:
#             narrow_recommendations.append(movie)
#             genres.update(movie_genres)
#         if len(narrow_recommendations) == n:
#             break
    
#     return [movie['id'] for movie in narrow_recommendations]



import logging

logging.basicConfig(level=logging.INFO)



def content_based_recommendations_general(movie_id, n=20, feature_file=None, tmdb_movieData_df=None):
    if feature_file is None or tmdb_movieData_df is None:
        raise ValueError("feature_file and tmdb_movieData_df must be provided")
    
    def compute_similarity(movie_features, all_features):
        return cosine_similarity(movie_features, all_features)[0]

    try:
        with h5py.File(feature_file, 'r') as f:
            all_features = f['features'][:]
        logging.info(f"Loaded features with shape: {all_features.shape}")
        
        if movie_id not in tmdb_movieData_df['id'].values:
            raise ValueError(f"Movie ID {movie_id} not found in the dataset")
        
        movie_index = tmdb_movieData_df.index[tmdb_movieData_df['id'] == movie_id].tolist()[0]
        movie_features = all_features[movie_index].reshape(1, -1)
        
        similarities = compute_similarity(movie_features, all_features)
        
        # Get top 2n similar movies to allow for diversity
        similar_indices = similarities.argsort()[::-1][1:2*n+1]
        similar_movies = tmdb_movieData_df.iloc[similar_indices].copy()
        
        # Apply quality, recency, and production scale considerations
        similar_movies['final_score'] = (
            similar_movies['quality_score'] * 0.5 +
            similar_movies['recency_score'] * 0.2 +
            similar_movies['success_score'] * 0.3
        )
        
        similar_movies = similar_movies.sort_values('final_score', ascending=False)
        
        # Get target movie genres
        target_movie_genres = set(str(tmdb_movieData_df.loc[movie_index, 'genres']).split())
        genres = target_movie_genres.copy()
        narrow_recommendations = []
        
        for _, movie in similar_movies.iterrows():
            movie_genres = set(str(movie['genres']).split())
            if len(genres.intersection(movie_genres)) >= 2:
                narrow_recommendations.append(movie)
                genres.update(movie_genres)
            if len(narrow_recommendations) == n:
                break
        
        recommendations = [
            {
                'id': movie['id'],
                'poster_path': movie['poster_path'] if pd.notna(movie['poster_path']) else None,
                'revenue': movie['revenue'] if pd.notna(movie['revenue']) else 0,
                'title': movie['title'],
                'original_language' : movie['original_language'] if pd.notna(movie['original_language']) else "",
                'vote_average': movie['vote_average'] if pd.notna(movie['vote_average']) else 0
            }
            for movie in narrow_recommendations
        ]
        logging.info(f"Generated {len(recommendations)} recommendations")
        return recommendations
    
    except Exception as e:
        logging.error(f"Error in content_based_recommendations: {str(e)}", exc_info=True)
        raise















# # Test content-based recommendations
# test_movie_id = 19995  # Avatar
# content_recs = content_based_recommendations(test_movie_id)
# print(f"Content-based recommendations for movie {test_movie_id}: {content_recs}")



# def train_collaborative_model():
#     reader = Reader(rating_scale=(0, 5.0))
#     data = Dataset.load_from_df(final_df[['userId', 'id', 'rating']], reader)
#     trainset = data.build_full_trainset()
#     model = SVD()
#     model.fit(trainset)
#     return model
#################################################################################################COLLABORATIVE BASED RECOMMENDING SYSTEM###############################################################################################################

def collaborative_recommendations(user_id, model, n=10):
    user_movies = set(final_df[final_df['userId'] == user_id]['id'])
    all_movies = set(tmdb_movieData_df['id'])
    movies_to_predict = list(all_movies - user_movies)
    
    predictions = [model.predict(user_id, movie_id) for movie_id in movies_to_predict]
    top_predictions = sorted(predictions, key=lambda x: x.est, reverse=True)[:n]
    return [pred.iid for pred in top_predictions]

# # Train the collaborative model
# cf_model = train_collaborative_model()

# # Test collaborative recommendations
# test_user_id = 1
# collab_recs = collaborative_recommendations(test_user_id, cf_model)
# print(f"Collaborative recommendations for user {test_user_id}: {collab_recs}")

def hybrid_recommendations(user_id, movie_id, content_weight=0.5, n=10):
    content_recs = content_based_recommendations(movie_id, n=n*2)
    print(content_recs)
    collab_recs = collaborative_recommendations(user_id, cf_model, n=n*2)
    print(collab_recs)
    
    # Combine recommendations
    hybrid_recs = {}
    for movie in content_recs:
        hybrid_recs[movie] = content_weight
    for movie in collab_recs:
        if movie in hybrid_recs:
            hybrid_recs[movie] += (1 - content_weight)
        else:
            hybrid_recs[movie] = 1 - content_weight
    
    # Get final recommendations
    # sorted_recs = sorted(hybrid_recs.items(), key=lambda x: x[1], reverse=True)[:n*2]
    # final_recs = []
    # genres = set()
    # for movie_id, _ in sorted_recs:
    #     movie = tmdb_movieData_df[tmdb_movieData_df['id'] == movie_id].iloc[0]
    #     movie_genres = set(movie['genres'].split())
    #     if len(genres.intersection(movie_genres)) < 2:
    #         final_recs.append(movie_id)
    #         genres.update(movie_genres)
    #     if len(final_recs) == n:
    #         break
    sorted_recs = sorted(hybrid_recs.items(), key=lambda x: x[1], reverse=True)[:n*2]

    final_recs = []
    for movie_id, _ in sorted_recs:
      filtered_movie = tmdb_movieData_df[tmdb_movieData_df['id'] == movie_id]
      if filtered_movie.empty:
        continue  # Skip if no movie is found
      movie = filtered_movie.iloc[0]
      final_recs.append(movie_id)
      if len(final_recs) == n:
        break
    
    return final_recs


# Example usage
def test():
    user_id = 1

    # movie_id = 299536  # Avengers: Infinity War
    # movie_id = 762441 # A quiet place - day one. New movie so might be good to test. Outcome - Okay - not so bad. 
    movie_id = 27205 # Inception Outcome - First two recommendations were great. Next ones, not so great.
    # movie_id = 293660 # Deadpool Outcome - good repsonses
    # movie_id = 360814 # Dangal - For a different language to test Output output - pretty poor. Not any similar movies tbh. Although might be difficult to get any collaborative outputs.
    recommendations = hybrid_recommendations(user_id, movie_id)
    print(f"Hybrid recommendations for user {user_id} based on movie {movie_id}:")
    print(recommendations)

    # To see details of recommended movies
    recommended_movies = tmdb_movieData_df[tmdb_movieData_df['id'].isin(recommendations)]
    print(recommended_movies[['id','poster_path', 'title', 'genres', 'vote_average', 'release_date', 'revenue']])


