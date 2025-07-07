# backend/src/routes/sales.py

from flask import Blueprint, request, jsonify, session
from src.database import create_sale, get_sales_history, get_sale_details, process_refund, get_db_connection
from src.helpers import login_required
import decimal # <--- THIS IS THE FIX

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/sales', methods=['GET'])
@login_required
def get_history():
    history = get_sales_history()
    return jsonify(history)

@sales_bp.route('/sales/<int:sale_id>', methods=['GET'])
@login_required
def get_details(sale_id):
    details = get_sale_details(sale_id)
    if details:
        return jsonify(details)
    return jsonify({'message': 'Sale not found'}), 404

@sales_bp.route('/sales', methods=['POST'])
@login_required
def new_sale():
    data = request.get_json()
    items = data.get('items')
    payment_type = data.get('payment_type')
    user_id = session.get('user_id')

    if not items or not payment_type or not user_id:
        return jsonify({'message': 'Missing required sale data'}), 400

    try:
        total_amount = sum(decimal.Decimal(str(item['price'])) * int(item['quantity']) for item in items)
    except (TypeError, decimal.InvalidOperation) as e:
         return jsonify({'message': f'Invalid item data in cart: {e}'}), 400
    
    sale_id = create_sale(user_id, items, float(total_amount), payment_type)
    
    return jsonify({'message': 'Sale created successfully', 'sale_id': sale_id}), 201

@sales_bp.route('/sales/<int:sale_id>/refund', methods=['POST'])
@login_required # Or @admin_required if only admins can do refunds
def refund_sale(sale_id):
    user_id = session.get('user_id')
    try:
        # We need to check if the sale is already refunded before processing
        conn = get_db_connection()
        sale = conn.execute('SELECT status FROM Sales WHERE sale_id = ?', (sale_id,)).fetchone()
        conn.close()
        
        if sale is None:
            return jsonify({'message': 'Sale not found.'}), 404
        if sale['status'] == 'REFUNDED':
            return jsonify({'message': 'This sale has already been refunded.'}), 400

        process_refund(sale_id, user_id)
        return jsonify({'message': f'Sale #{sale_id} has been successfully refunded.'}), 200
    except Exception as e:
        return jsonify({'message': f'Failed to process refund: {str(e)}'}), 500
