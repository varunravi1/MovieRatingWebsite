# recommender_server.py

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from surprise import SVD, Dataset, Reader
from recommender_system import hybrid_recommendations
from recommender_system import content_based_recommendations_general
import logging
logging.basicConfig(level=logging.INFO)
app = Flask(__name__)

# Load your model and data
cf_model = joblib.load('cf_model.joblib')
tmdb_movieData_df = pd.read_csv('tmdb_movieData_df.csv')
final_df = pd.read_csv('final_df.csv')
feature_file = 'movie_features.h5'


logging.info(f"Loaded tmdb_movieData_df with shape: {tmdb_movieData_df.shape}")
@app.route('/recommend/general', methods=['POST'])
def recommend():
    print('inside recommend')
    data = request.json
    # user_id = data['user_id']
    movie_id = data['movie_id']
    print(movie_id)
    try:
        # Your recommendation logic here
        recommendations = content_based_recommendations_general(int(movie_id), 20, feature_file, tmdb_movieData_df)
        # recommendations = hybrid_recommendations(user_id, movie_id)
        print(recommendations)
    except Exception as e:
        print(f"Error generating recmomendations: {str(e)}")
        return jsonify({'error': 'Failed to generate recommendations'}), 500
    
    return jsonify({'recommendations': recommendations})



if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=True)
        print("Successfully running on port 5000")
    except Exception as e:
        print(f"Error starting flask server {str(e)}" )