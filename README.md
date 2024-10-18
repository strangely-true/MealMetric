# MealMetric

#### Video Demo: [link](https://www.youtube.com/watch?v=0nOlmNm4FMw)

## Description

MealMetric is a comprehensive web application designed to serve as an intuitive and powerful nutrition calculator. It allows users to create, manage, and analyze recipes while tracking detailed nutritional information of ingredients. This tool is perfect for anyone looking to monitor their dietary intake and gain insights into the nutritional value of their meals.

## Key Features

- **Nutritional Data Fetching:** Utilizes the [Natural Language for Nutrients API](https://docx.syndigo.com/developers/docs/natural-language-for-nutrients) to fetch real-time nutritional data for ingredients.
- **Recipe Management:** Users can add, view, edit, and delete recipes with ease.
- **Real-time Nutritional Overview:** Dynamically calculates and displays comprehensive nutritional content for each recipe.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## Technology Stack

- **Backend:** Node.js with Express.js
- **Frontend:** EJS (Embedded JavaScript templating)
- **Database:** PostgreSQL
- **API Integration:** Axios for making requests to the Natural Language for Nutrients API

## Installation Guide

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/strangely-true/MealMetric.git
   cd MealMetric
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL Database:**
   - Install PostgreSQL: [PostgreSQL Documentation](https://www.postgresql.org/)
   - Create a database named `mealmetric_db`
   - Run the SQL queries from `db/queries.sql` to set up the required tables

4. **Configure Environment Variables:**
   Create a `.env` file in the root directory with the following:
   ```
   DATABASE_URL=postgres://<your_username>:<your_password>@localhost:5432/mealmetric_db
   NUTRITIONIX_APP_ID=your_APP_ID
   NUTRITIONIX_API_KEY=your_API_KEY
   ```

5. **Start the Application:**
   ```bash
   node app.js
   ```
   The app will be available at `http://localhost:3000`

## Usage

1. **Registration and Login:** New users can register and then log in to access the app's features.
2. **Creating Recipes:** Add new recipes by specifying name, ingredients, and quantities.
3. **Managing Recipes:** View, edit, or delete saved recipes.
4. **Nutritional Overview:** See real-time updates of nutritional information as you modify recipes.

## File Structure

```
MealMetric/
├── db/
│   └── queries.sql
├── public/
│   ├── css/
│   └── js/
├── views/
│   ├── index.ejs
│   ├── edit_recipe.ejs
│   ├── landing.ejs
│   ├── login.ejs
│   ├── new_recipe.ejs
│   ├── signup.ejs
│   └── recipe.ejs
├── app.js
├── db.js
├── .gitignore
├── package.json
├── README.md
└── .env
```


---

### Files and Folders:

1.  **`app.js`:**
    
    -   Contains the core logic of the application, including routing, API calls, and interactions with the PostgreSQL database.
    -   Also handles user registration, login, and session management.
    
2.  **`db.js`:**
    
    -   Contains all the database models for storing user information, recipes, and ingredient details.
    
3.  **`views/` (templates):**
    
    -   This folder includes all the EJS files that render the web pages dynamically, such as the home page, recipe form, and individual recipe details.
    
4.  **`public/`:**
    
    -   Contains static assets like CSS files, JavaScript files, and images for styling the application.
    
5.  **`db/queries.sql`:**
    
    -   Contains the SQL queries to set up the database schema, including tables for users, recipes, ingredients, and nutritional information.


---

### Features:

-   **Nutritional Calculation:** The app fetches real-time nutritional data from an API based on user-inputted ingredients.
-   **Recipe Management:** Users can create, update, and delete their recipes while tracking nutritional metrics.
-   **User Authentication:** Includes a hashing-based login and signup system with user information securely stored in a PostgreSQL database.
-   **Dynamic Interface:** Users can seamlessly add or remove ingredients on the recipe form, with immediate recalculation of nutritional totals.
-   **Responsive Design:** The app is fully responsive and optimized for both desktop and mobile devices.

---

ℹ️ **Note:**

-   All the nutritional data is fetched via the Natural Language for Nutrients API, and I do not own any of the data provided by the API.

---


For more information on the Natural Language for Nutrients API, visit their [official documentation](https://docx.syndigo.com/developers/docs/natural-language-for-nutrients).

For PostgreSQL documentation, refer to the [official PostgreSQL website](https://www.postgresql.org/).