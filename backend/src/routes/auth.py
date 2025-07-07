# backend/src/routes/auth.py
from flask import Blueprint, request, jsonify, session
from src.database import authenticate_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = authenticate_user(username, password)
    if user:
        session['user_id'] = user['user_id']
        session['username'] = user['username']
        session['role'] = user['role']
        return jsonify({
            'message': 'Login successful',
            'user': {'username': user['username'], 'role': user['role']}
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/status', methods=['GET'])
def status():
    if 'user_id' in session:
        return jsonify({
            'isLoggedIn': True,
            'user': {'username': session['username'], 'role': session['role']}
        }), 200
    return jsonify({'isLoggedIn': False}), 200
