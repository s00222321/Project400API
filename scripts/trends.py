import sys
import pymongo
import json
import os
from bson import json_util
from dotenv import load_dotenv
from urllib.parse import urlparse
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load environment variables
load_dotenv()

# Get MongoDB URI from .env file
MONGO_URI = os.getenv("MONGO_URI")
COLLECTION_NAME = "actions"  # Match your Mongoose model

# Extract the database name from the MongoDB URI
parsed_uri = urlparse(MONGO_URI)
db_name = parsed_uri.path[1:]  # Extract the database name from URI

# Get user ID from command-line arguments
user_id = sys.argv[1] if len(sys.argv) > 1 else None

if not user_id:
    print(json.dumps({"error": "No User ID provided"}))
    sys.exit(1)

try:
    # Connect to MongoDB
    client = pymongo.MongoClient(MONGO_URI)
    db = client[db_name]  # Use the database name from URI
    collection = db[COLLECTION_NAME]

    # Fetch data for the given user ID
    user_actions = list(collection.find({"userId": user_id}))

    if not user_actions:
        print(json.dumps({"error": "No data found for the given user ID"}))
        sys.exit(1)

    # Convert MongoDB documents to JSON format and load into a DataFrame
    user_data = pd.json_normalize(user_actions)

    # Check if the necessary columns exist
    if 'timestamp' not in user_data.columns or 'reactionTime' not in user_data.columns:
        print(json.dumps({"error": "Required fields 'timestamp' and 'reactionTime' not found in the data."}))
        sys.exit(1)

    # Convert 'timestamp' to datetime
    user_data['timestamp'] = pd.to_datetime(user_data['timestamp'])

    # Sort the data by timestamp
    user_data.sort_values('timestamp', inplace=True)

    # ---- Descriptive Statistics ----
    reaction_time_stats = user_data['reactionTime'].describe()

    # ---- Time-Based Analysis: Daily Reaction Time ----
    user_data['date'] = user_data['timestamp'].dt.date
    daily_avg_reaction_time = user_data.groupby('date')['reactionTime'].mean()

    # ---- Time-Based Analysis: Weekly Reaction Time ----
    user_data['week'] = user_data['timestamp'].dt.to_period('W')
    weekly_avg_reaction_time = user_data.groupby('week')['reactionTime'].mean()

    # ---- Identifying Outliers (Reaction Time) ----
    Q1 = user_data['reactionTime'].quantile(0.25)
    Q3 = user_data['reactionTime'].quantile(0.75)
    IQR = Q3 - Q1
    outliers = user_data[(user_data['reactionTime'] < (Q1 - 1.5 * IQR)) | (user_data['reactionTime'] > (Q3 + 1.5 * IQR))]

    # ---- Hand & Finger Performance Analysis ----
    hand_finger_performance = user_data.groupby(['hand', 'finger'])['reactionTime'].mean()

    # ---- Game Mode Performance ----
    game_mode_performance = user_data.groupby('gameMode')['reactionTime'].mean()

    # Convert datetime and date fields to string to make them serializable
    result_data = {
        "descriptive_statistics": reaction_time_stats.to_dict(),
        "daily_average_reaction_time": {str(date): value for date, value in daily_avg_reaction_time.items()},
        "weekly_average_reaction_time": {str(week): value for week, value in weekly_avg_reaction_time.items()},
        "outliers_in_reaction_time": [
            {
                "userId": action["userId"],
                "timestamp": action["timestamp"].isoformat(),  # Convert to ISO 8601 string
                "reactionTime": action["reactionTime"],
                "finger": action["finger"],
                "hand": action["hand"],
                "gameMode": action["gameMode"]
            } for action in outliers.to_dict(orient='records')
        ],
        "hand_finger_performance": {f"{hand}-{finger}": value for (hand, finger), value in hand_finger_performance.items()},
        "game_mode_performance": game_mode_performance.to_dict()
    }

    # Output the result as a JSON string
    print(json.dumps(result_data, default=json_util.default))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
