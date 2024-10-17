$(document).ready(function() {
  let ingredientCount = 0;

  function addIngredient() {
      const ingredientHtml = `
          <div class="ingredient-item bg-green-50 p-4 rounded-lg mb-4">
              <input type="text" name="ingredientName[]" placeholder="Ingredient name" required
                     class="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <input type="number" name="ingredientQuantity[]" placeholder="Quantity" required
                     class="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <select name="ingredientUnit[]" required
                      class="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="grams">Grams</option>
                  <option value="ml">Milliliters</option>
                  <option value="serving">Serving</option>
              </select>
              <button type="button" class="remove-ingredient bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                  Remove
              </button>
          </div>
      `;
      $('#ingredientList').append(ingredientHtml);
      ingredientCount++;
  }

  $('#addIngredientBtn').click(addIngredient);

  $(document).on('click', '.remove-ingredient', function() {
      $(this).closest('.ingredient-item').remove();
      ingredientCount--;
  });

  $('#newRecipeForm').submit(function(e) {
      if (ingredientCount === 0) {
          e.preventDefault();
          alert('Please add at least one ingredient to your recipe.');
      }
  });

  // Add the first ingredient by default
  addIngredient();
});