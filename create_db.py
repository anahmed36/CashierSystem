# create_db.py
import sqlite3
import os

DB_DIR = os.path.join('backend', 'database')
DB_PATH = os.path.join(DB_DIR, 'cashier_system.db')

def create_database():
    # Create directory if it doesn't exist
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)

    # Remove old DB if it exists
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    with open('schema.sql', 'r') as f:
        schema = f.read()
    cursor.executescript(schema)

    # Insert sample data for Users
    cursor.execute("INSERT INTO Users (username, password, role) VALUES (?, ?, ?)", ('admin', 'adminpass', 'admin'))
    cursor.execute("INSERT INTO Users (username, password, role) VALUES (?, ?, ?)", ('cashier1', 'cashierpass', 'cashier'))

    # Insert sample data for Products
    cursor.execute("INSERT INTO Products (barcode, name, price, stock) VALUES (?, ?, ?, ?)", ('123456789012', 'Laptop', 1200.00, 50))
    cursor.execute("INSERT INTO Products (barcode, name, price, stock) VALUES (?, ?, ?, ?)", ('987654321098', 'Mouse', 25.50, 200))
    cursor.execute("INSERT INTO Products (barcode, name, price, stock) VALUES (?, ?, ?, ?)", ('112233445566', 'Keyboard', 75.00, 100))
    cursor.execute("INSERT INTO Products (barcode, name, price, stock) VALUES (?, ?, ?, ?)", ('223344556677', 'Webcam', 45.00, 75))

    conn.commit()
    conn.close()

    print(f"Database created at '{DB_PATH}' successfully with sample data.")

if __name__ == '__main__':
    create_database()