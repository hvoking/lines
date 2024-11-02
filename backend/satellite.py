from flask import Flask, render_template, jsonify
import requests as req
import json
import threading
import time

from flask_cors import CORS, cross_origin  # Import the CORS module

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/get_satellite_positions": {"origins": "http://localhost:5000"}})

app = Flask(__name__)

# Function to obtain satellite positions
def fetch_data(sat_id, destination_lat, destination_lon, total_future_time):
    temp_url = f"""
        https://api.n2yo.com/rest/v1/satellite/positions/
        {sat_id}/
        {destination_lat}/
        {destination_lon}/
        0/
        {total_future_time}/
        &apiKey=UTCUUV-CQ3H3N-747ABU-5CPW
    """
    url = ''.join(temp_url.split())
    response = req.get(url)
    try:
        return response.json()
    except json.decoder.JSONDecodeError:
        return None

# Function to calculate the complete orbit of the satellite
def calculate_complete_orbit(sat_id, destination_lat, destination_lon):
    total_future_time = 5940  # Total future time in seconds
    future_positions_response = fetch_data(sat_id, destination_lat, destination_lon, total_future_time)

    if future_positions_response is not None:
        if isinstance(future_positions_response, dict) and 'positions' in future_positions_response:
            return future_positions_response['positions']
        else:
            return None
    else:
        return None

# Route to render the map with Mapbox
@app.route('/')
def index():
    destination_lat = 40.4207
    destination_lon = -3.7070
    return render_template('index.html', destination_lat=destination_lat, destination_lon=destination_lon)

# Route to provide satellite orbit data
@app.route('/get_satellite_positions')
@cross_origin()
def get_satellite_positions():
    destination_lat = 40.4207
    destination_lon = -3.7070

    positions1 = calculate_complete_orbit(39084, destination_lat, destination_lon)  # Landsat 8
    positions2 = calculate_complete_orbit(49260, destination_lat, destination_lon)  # Landsat 9

    if not positions1 or not positions2:
        return jsonify({"error": "Positions not available"})

    # Send the positions as JSON to the front-end
    return jsonify({
        "satellite1": positions1,
        "satellite2": positions2
    })

# Function to periodically update the map
def update_map():
    while True:
        time.sleep(14)

# Start thread to update the map
threading.Thread(target=update_map, daemon=True).start()

if __name__ == '__main__':
    app.run(debug=True)