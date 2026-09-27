CREATE DATABASE IF NOT EXISTS ecommerce_crud;
USE ecommerce_crud;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  brand VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  category VARCHAR(100),
  image VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, brand, price, mrp, category, image, description) VALUES
('Printed Casual T-Shirt', 'Roadster', 499, 999, 'Men', '', '100% cotton, regular fit printed t-shirt'),
('Floral Maxi Dress', 'DressBerry', 1299, 2599, 'Women', '', 'Floral print maxi dress with flared hem'),
('Slim Fit Jeans', 'Levis', 1799, 2999, 'Men', '', 'Blue slim fit mid-rise jeans'),
('Running Shoes', 'Nike', 3499, 4999, 'Footwear', '', 'Lightweight running shoes with cushioned sole'),
('Handheld Leather Bag', 'H&M', 2299, 4599, 'Accessories', '', 'Premium leather handheld bag'),
('Kurti with Palazzo Set', 'Libas', 899, 1799, 'Women', '', 'Printed kurta with palazzo set'),
('Analog Watch', 'Fastrack', 1499, 2499, 'Accessories', '', 'Stylish analog watch with leather strap'),
('Sports Sneakers', 'Adidas', 2799, 3999, 'Footwear', '', 'Comfortable sports sneakers for daily wear'),
('Denim Jacket', 'Tokyo Talkies', 1199, 2399, 'Women', '', 'Classic blue denim jacket'),
('Formal Shirt', 'Peter England', 999, 1999, 'Men', '', 'Slim fit formal shirt, wrinkle free');