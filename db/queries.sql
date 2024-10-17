-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Recipes Table
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    instructions TEXT,
    total_calories DECIMAL,
    total_fat DECIMAL,
    total_protein DECIMAL,
    total_carbohydrates DECIMAL,
    total_cholesterol DECIMAL,
    total_sodium DECIMAL,
    total_sugar DECIMAL,
    total_fiber DECIMAL
    total_potassium DECIMAL
);

-- Create Ingredients Table
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL,
    unit VARCHAR(50),
    calories DECIMAL,
    fat DECIMAL,
    protein DECIMAL,
    carbohydrates DECIMAL
    cholesterol DECIMAL,
    sodium DECIMAL,
    sugar DECIMAL,
    fiber DECIMAL
    potassium DECIMAL
);
