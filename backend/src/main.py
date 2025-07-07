# backend/src/main.py

import os
import sys
# This line is for running `flask run` from the `backend` directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, send_from_directory, session
from flask_cors import CORS
from src.routes.auth import auth_bp
from src.routes.products import products_bp
from src.routes.sales import sales_bp
from src.routes.reports import reports_bp
from datetime import timedelta

# Set up static folder path relative to this file
static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'frontend', 'dist')
if not os.path.exists(static_folder):
    print(f"Warning: Static folder not found at '{static_folder}'. Did you build the frontend (`npm run build`)?")
    static_folder = None

app = Flask(__name__, static_folder=static_folder, static_url_path='')
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT' # Should be a long random string in production
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)

# Configure CORS to allow credentials from your frontend's origin
CORS(app, supports_credentials=True, origins=["http://localhost:5173"]) 

# This should work fine without FLASK_APP being set if run with `flask run` inside `backend` dir
# or `python -m src.main` from inside `backend` dir.
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(products_bp, url_prefix='/api')
app.register_blueprint(sales_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if app.static_folder is None:
        return "Static folder not configured. Please build the frontend.", 404
        
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        index_path = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, 'index.html')
        else:
             return "index.html not found. Please build the frontend.", 404


if __name__ == '__main__':
    # Using '0.0.0.0' makes it accessible from your network.
    # debug=True enables auto-reloading and should NOT be used in production.
    app.run(host='0.0.0.0', port=5000, debug=True)
