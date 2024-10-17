// Required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const pool = require('./db'); // PostgreSQL pool connection
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Middleware to ensure login
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Fetch nutritional data from Nutritionix API
async function fetchNutritionalData(name, quantity, unit) {
  try {
    const response = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      {
        query: quantity +' '+ unit+ ' ' + name,
      },
      
      {
        headers: {
          'x-app-id': process.env.NUTRITIONIX_APP_ID,
          'x-app-key': process.env.NUTRITIONIX_API_KEY,
          'Content-Type': 'application/json',
          
        },
      }
    );
    const food = response.data.foods[0];
    console.log(food);
    return {
      name: food.food_name,
      calories: food.nf_calories,
      protein: food.nf_protein,
      carbs: food.nf_total_carbohydrate,
      fat: food.nf_total_fat,
      cholesterol: food.nf_cholesterol,
      sodium: food.nf_sodium,
      fiber: food.nf_dietary_fiber,
      sugar: food.nf_sugars,
      potassium: food.nf_potassium,
      photo: food.photo.thumb,
    };
  } catch (error) {
    console.error('Error fetching nutritional data:', error);
    throw new Error('Failed to fetch nutritional data.');
  }
}

// Routes

// Landing page
app.get('/', (req, res) => {
  res.render('landing');
});

// User signup
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).send('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    req.session.userId = result.rows[0].id;
    res.redirect('/index');
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).send('Signup failed.');
  }
});

// User login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    req.session.userId = user.id;
    res.redirect('/index');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Login failed.');
  }
});

// Dashboard (user's recipe page)
app.get('/index', requireLogin, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.session.userId]);
    const username = userResult.rows[0].username;

    const recipesResult = await pool.query(
      'SELECT * FROM recipes WHERE user_id = $1',
      [req.session.userId]
    );

    const recipes = recipesResult.rows;
    res.render('index', { username: username, recipes: recipes });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Error loading index page');
  }
});

// Create a new recipe
app.get('/new_recipe', requireLogin, (req, res) => {
  res.render('new_recipe', { username: req.session.username });
});

app.post('/recipes', requireLogin, async (req, res) => {
  const { recipeName,instructions, ingredientName, ingredientQuantity, ingredientUnit } = req.body; // Destructure the correct properties

  try {
    // Validate that ingredients are provided
    if (!ingredientName || !ingredientQuantity || !ingredientUnit || 
        ingredientName.length === 0 || ingredientQuantity.length === 0 || ingredientUnit.length === 0) {
      return res.status(400).send('Ingredients must be provided.');
    }

    // Create an array of ingredient objects
    const ingredients = ingredientName.map((name, index) => ({
      name: name,
      quantity: ingredientQuantity[index],
      unit: ingredientUnit[index],
    }));

    // Insert the recipe into the database
    const newRecipe = await pool.query(
      'INSERT INTO recipes (name, user_id,instructions) VALUES ($1, $2,$3) RETURNING id',
      [recipeName, req.session.userId, instructions]
    );

    const recipeId = newRecipe.rows[0].id;

    // For each ingredient, fetch nutritional data and store it
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalCholesterol = 0, totalSodium = 0, totalFiber = 0, totalSugar = 0, totalPotassium = 0;

    for (let ingredient of ingredients) {
      const { name, quantity, unit } = ingredient;

      // Validate ingredient fields
      if (!name || !quantity || !unit) {
        return res.status(400).send('Each ingredient must have a name, quantity, and unit.');
      }

      const nutritionData = await fetchNutritionalData(name, quantity, unit);

      // Accumulate total nutritional values
      totalCalories += nutritionData.calories;
      totalProtein += nutritionData.protein;
      totalCarbs += nutritionData.carbs;
      totalFat += nutritionData.fat;
      totalCholesterol += nutritionData.cholesterol;
      totalSodium += nutritionData.sodium;
      totalFiber += nutritionData.fiber;
      totalSugar += nutritionData.sugar;
      totalPotassium += nutritionData.potassium;

      // Insert ingredient into the database
      await pool.query(
        'INSERT INTO ingredients (recipe_id, name, quantity, unit, calories, protein, carbs, fat, cholesterol, sodium, fiber,sugar, potassium) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [recipeId, name, quantity, unit, nutritionData.calories, nutritionData.protein, nutritionData.carbs, nutritionData.fat, nutritionData.cholesterol, nutritionData.sodium, nutritionData.fiber, nutritionData.sugar, nutritionData.potassium]
      );
    }
    // Update the total nutrition values for the recipe
    await pool.query(
      'UPDATE recipes SET total_calories = $1, total_protein = $2, total_carbs = $3, total_fat = $4,total_cholesterol = $5,total_sodium = $6,total_fiber = $7,total_sugar = $8,total_potassium = $9 WHERE id = $10',
      [totalCalories, totalProtein, totalCarbs, totalFat,totalCholesterol,totalSodium,totalFiber,totalSugar,totalPotassium, recipeId]
    );
    

    res.redirect('/index');
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).send('Error creating recipe');
  }
});


// Get recipe details
app.get('/recipes/:id', requireLogin, async (req, res) => {
  try {
    const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.id]);
    const ingredients = await pool.query('SELECT * FROM ingredients WHERE recipe_id = $1', [req.params.id]);

    res.render('recipe', {
      recipe: recipe.rows[0],
      ingredients: ingredients.rows,
    });
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    res.status(500).send('Error fetching recipe details');
  }
});
// GET route to render edit form for a recipe
app.get('/recipes/:id/edit', requireLogin, async (req, res) => {
  try {
    const recipe = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.id]);
    const ingredients = await pool.query('SELECT * FROM ingredients WHERE recipe_id = $1', [req.params.id]);
    
    res.render('edit_recipe', {
      recipe: recipe.rows[0],
      ingredients: ingredients.rows
    });
  } catch (error) {
    console.error('Error fetching recipe for editing:', error);
    res.status(500).send('Error loading edit form');
  }
});


// PUT route to edit a recipe
app.put('/recipes/:id', requireLogin, async (req, res) => {
  const { recipeName, ingredients } = req.body;
  
  try {
    // Validate the recipe name
    if (!recipeName) {
      return res.status(400).send('Recipe name is required.');
    }

    // Update the recipe name
    await pool.query(
      'UPDATE recipes SET name = $1 WHERE id = $2 AND user_id = $3',
      [recipeName, req.params.id, req.session.userId]
    );

    // Accumulate total nutritional values
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

    // Delete existing ingredients for this recipe
    await pool.query('DELETE FROM ingredients WHERE recipe_id = $1', [req.params.id]);

    // Loop through ingredients to add them
    for (let ingredient of ingredients) {
      const { name, quantity, unit } = ingredient;

      // Validate ingredient fields
      if (!name || !quantity || !unit) {
        return res.status(400).send('Each ingredient must have a name, quantity, and unit.');
      }

      // Fetch the nutritional data for the ingredient
      const nutritionData = await fetchNutritionalData(name, quantity, unit);

      // Accumulate nutritional values for the entire recipe
      totalCalories += nutritionData.calories;
      totalProtein += nutritionData.protein;
      totalCarbs += nutritionData.carbs;
      totalFat += nutritionData.fat;

      // Insert each ingredient into the ingredients table
      await pool.query(
        'INSERT INTO ingredients (recipe_id, name, quantity, unit, calories, protein, carbs, fat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [req.params.id, name, quantity, unit, nutritionData.calories, nutritionData.protein, nutritionData.carbs, nutritionData.fat]
      );
    }

    // Update the total nutritional values for the recipe
    await pool.query(
      'UPDATE recipes SET total_calories = $1, total_protein = $2, total_carbs = $3, total_fat = $4 WHERE id = $5',
      [totalCalories, totalProtein, totalCarbs, totalFat, req.params.id]
    );

    // Redirect to the updated recipe page
    res.redirect(`/recipes/${req.params.id}`);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).send('Error updating recipe');
  }
});


// DELETE route to delete a recipe
app.delete('/recipes/:id', requireLogin, async (req, res) => {
  try {
    // Delete ingredients associated with the recipe
    await pool.query('DELETE FROM ingredients WHERE recipe_id = $1', [req.params.id]);

    // Delete the recipe
    await pool.query('DELETE FROM recipes WHERE id = $1 AND user_id = $2', [req.params.id, req.session.userId]);

    res.status(200).send('Recipe deleted');
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).send('Error deleting recipe');
  }
});

// User logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  res.render('index', { error: err });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
