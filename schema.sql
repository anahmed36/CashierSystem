-- schema.sql

DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS SaleItems;
DROP TABLE IF EXISTS Sales;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'cashier'))
);

CREATE TABLE Products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
);

CREATE TABLE Sales (
    sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sale_date TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED', -- Can be 'COMPLETED' or 'REFUNDED'
    notes TEXT, -- For optional details like refund reason
    FOREIGN KEY (user_id) REFERENCES Users (user_id)
);

CREATE TABLE SaleItems (
    sale_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL, -- Price at the time of sale
    FOREIGN KEY (sale_id) REFERENCES Sales (sale_id),
    FOREIGN KEY (product_id) REFERENCES Products (product_id)
);

CREATE TABLE Payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    payment_type TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES Sales (sale_id)
);