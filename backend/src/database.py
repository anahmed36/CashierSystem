# backend/src/database.py

import sqlite3
import os
from datetime import datetime

DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'cashier_system.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def authenticate_user(username, password):
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM Users WHERE username = ? AND password = ?',
        (username, password)
    ).fetchone()
    conn.close()
    return dict(user) if user else None

def get_product_by_barcode(barcode):
    conn = get_db_connection()
    product = conn.execute(
        'SELECT * FROM Products WHERE barcode = ?',
        (barcode,)
    ).fetchone()
    conn.close()
    return dict(product) if product else None

def get_all_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM Products ORDER BY name').fetchall()
    conn.close()
    return [dict(product) for product in products]

def create_sale(user_id, items, total_amount, payment_type):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create sale record
    sale_date = datetime.now().isoformat()
    cursor.execute(
        'INSERT INTO Sales (user_id, sale_date, total_amount) VALUES (?, ?, ?)',
        (user_id, sale_date, total_amount)
    )
    sale_id = cursor.lastrowid
    
    # Create sale items
    for item in items:
        cursor.execute(
            'INSERT INTO SaleItems (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            (sale_id, item['product_id'], item['quantity'], item['price'])
        )
        
        # Update stock
        cursor.execute(
            'UPDATE Products SET stock = stock - ? WHERE product_id = ?',
            (item['quantity'], item['product_id'])
        )
    
    # Create payment record
    cursor.execute(
        'INSERT INTO Payments (sale_id, payment_type, amount, payment_date) VALUES (?, ?, ?, ?)',
        (sale_id, payment_type, total_amount, sale_date)
    )
    
    conn.commit()
    conn.close()
    return sale_id

def get_sales_history(limit=50):
    conn = get_db_connection()
    sales = conn.execute('''
        SELECT s.sale_id, s.sale_date, s.total_amount, s.status, u.username 
        FROM Sales s 
        JOIN Users u ON s.user_id = u.user_id 
        ORDER BY s.sale_date DESC 
        LIMIT ?
    ''', (limit,)).fetchall()
    conn.close()
    return [dict(sale) for sale in sales]

def get_sale_details(sale_id):
    conn = get_db_connection()
    
    # Get sale info
    sale = conn.execute('''
        SELECT s.*, u.username 
        FROM Sales s 
        JOIN Users u ON s.user_id = u.user_id 
        WHERE s.sale_id = ?
    ''', (sale_id,)).fetchone()
    
    # Get sale items
    items = conn.execute('''
        SELECT si.*, p.name, p.barcode 
        FROM SaleItems si 
        JOIN Products p ON si.product_id = p.product_id 
        WHERE si.sale_id = ?
    ''', (sale_id,)).fetchall()
    
    # Get payment info
    payment = conn.execute(
        'SELECT * FROM Payments WHERE sale_id = ?',
        (sale_id,)
    ).fetchone()
    
    conn.close()
    
    if not sale:
        return None

    return {
        'sale': dict(sale),
        'items': [dict(item) for item in items],
        'payment': dict(payment) if payment else None
    }

# --- PRODUCT MANAGEMENT FUNCTIONS ---

def add_product(barcode, name, price, stock):
    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO Products (barcode, name, price, stock) VALUES (?, ?, ?, ?)',
            (barcode, name, price, stock)
        )
        conn.commit()
    finally:
        conn.close()

def update_product(product_id, name, price, stock):
    conn = get_db_connection()
    try:
        conn.execute(
            'UPDATE Products SET name = ?, price = ?, stock = ? WHERE product_id = ?',
            (name, price, stock, product_id)
        )
        conn.commit()
    finally:
        conn.close()

def delete_product(product_id):
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM Products WHERE product_id = ?', (product_id,))
        conn.commit()
    finally:
        conn.close()
        
# --- REPORTING FUNCTION ---
def get_sales_report_data(start_date, end_date):
    """
    Fetches sales report data within a given date range.
    Only includes 'COMPLETED' sales in calculations.
    """
    conn = get_db_connection()
    
    # KPIs: Total revenue, total sales count for the period
    kpis = conn.execute('''
        SELECT 
            COUNT(sale_id) as total_sales,
            SUM(total_amount) as total_revenue
        FROM Sales
        WHERE status = 'COMPLETED' AND sale_date BETWEEN ? AND ?
    ''', (start_date, end_date)).fetchone()

    # Daily breakdown: Revenue per day
    daily_data = conn.execute('''
        SELECT 
            DATE(sale_date) as date,
            SUM(total_amount) as daily_revenue,
            COUNT(sale_id) as daily_sales_count
        FROM Sales
        WHERE status = 'COMPLETED' AND sale_date BETWEEN ? AND ?
        GROUP BY DATE(sale_date)
        ORDER BY date ASC
    ''', (start_date, end_date)).fetchall()
    
    # --- NEW QUERY for Top Selling Products ---
    top_products = conn.execute('''
        SELECT 
            p.name as product_name, 
            SUM(si.quantity) as total_quantity_sold
        FROM SaleItems si
        JOIN Products p ON si.product_id = p.product_id
        JOIN Sales s ON si.sale_id = s.sale_id
        WHERE s.status = 'COMPLETED' AND s.sale_date BETWEEN ? AND ?
        GROUP BY p.name
        ORDER BY total_quantity_sold DESC
        LIMIT 10
    ''', (start_date, end_date)).fetchall()

    conn.close()

    # Calculate average sale value, handling division by zero
    total_sales = kpis['total_sales'] if kpis and kpis['total_sales'] else 0
    total_revenue = kpis['total_revenue'] if kpis and kpis['total_revenue'] else 0.0
    avg_sale_value = total_revenue / total_sales if total_sales > 0 else 0.0

    return {
        'kpis': {
            'total_sales': total_sales,
            'total_revenue': total_revenue,
            'avg_sale_value': avg_sale_value,
        },
        'daily_data': [dict(row) for row in daily_data],
        'top_products': [dict(row) for row in top_products] # <-- ADD to returned data
    }
        
# --- REFUND FUNCTION ---
def process_refund(sale_id, processing_user_id):
    """
    Marks a sale as 'REFUNDED' and restores the stock for all items in that sale.
    This is a transactional operation.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        items_to_refund = cursor.execute(
            'SELECT product_id, quantity FROM SaleItems WHERE sale_id = ?',
            (sale_id,)
        ).fetchall()

        if not items_to_refund:
            raise Exception("No items found for this sale.")

        for item in items_to_refund:
            cursor.execute(
                'UPDATE Products SET stock = stock + ? WHERE product_id = ?',
                (item['quantity'], item['product_id'])
            )

        refund_note = f"Full refund processed by user_id {processing_user_id} on {datetime.now().isoformat()}"
        cursor.execute(
            "UPDATE Sales SET status = 'REFUNDED', notes = ? WHERE sale_id = ?",
            (refund_note, sale_id)
        )
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
