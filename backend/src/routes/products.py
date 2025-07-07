# backend/src/routes/products.py

from flask import Blueprint, jsonify, request
from src.database import (
    get_all_products, 
    get_product_by_barcode,
    add_product,
    update_product,
    delete_product
)
from src.helpers import login_required, admin_required
import sqlite3 # Import sqlite3 to handle potential integrity errors

products_bp = Blueprint('products', __name__)

# --- ACCESSIBLE TO ALL LOGGED-IN USERS ---

@products_bp.route('/products', methods=['GET'])
@login_required
def get_products():
    """Gets a list of all products. Accessible to any logged-in user."""
    products = get_all_products()
    return jsonify(products)

@products_bp.route('/products/<string:barcode>', methods=['GET'])
@login_required
def get_product(barcode):
    """Gets a single product by barcode for the cashier scanner."""
    product = get_product_by_barcode(barcode)
    if product:
        return jsonify(product)
    return jsonify({'message': 'Product not found'}), 404

# --- ADMIN ONLY ROUTES ---

@products_bp.route('/products', methods=['POST'])
@admin_required
def create_product_route():
    """Creates a new product."""
    data = request.get_json()
    if not all(k in data for k in ('barcode', 'name', 'price', 'stock')):
        return jsonify({'message': 'Missing required product data'}), 400
    try:
        add_product(data['barcode'], data['name'], float(data['price']), int(data['stock']))
        return jsonify({'message': 'Product added successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': f"Failed to add product: A product with barcode '{data['barcode']}' already exists."}), 409 # 409 Conflict
    except Exception as e:
        return jsonify({'message': f'Failed to add product: {e}'}), 500

@products_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product_route(product_id):
    """Updates an existing product."""
    data = request.get_json()
    if not all(k in data for k in ('name', 'price', 'stock')):
        return jsonify({'message': 'Missing required product data'}), 400
    try:
        update_product(product_id, data['name'], float(data['price']), int(data['stock']))
        return jsonify({'message': 'Product updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Failed to update product: {e}'}), 500

@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product_route(product_id):
    """Deletes a product."""
    try:
        delete_product(product_id)
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Failed to delete product: {e}'}), 500
