document.addEventListener('DOMContentLoaded', () => {
  const ingredientList = document.getElementById('ingredientList');
  const addIngredientBtn = document.getElementById('addIngredientBtn');

  addIngredientBtn.addEventListener('click', () => {
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'form-group mt-3';
    ingredientDiv.innerHTML = `
      <input type="text" class="form-control mb-2" name="ingredientName[]" placeholder="Ingredient name" required>
      <input type="number" class="form-control mb-2" name="ingredientQuantity[]" placeholder="Quantity" required>
      <select class="form-control mb-2" name="ingredientUnit[]">
        <option value="g">Grams</option>
        <option value="ml">Milliliters</option>
        <option value="serving">Serving</option>
      </select>
      <button type="button" class="btn btn-danger remove-ingredient-btn">Remove</button>
    `;

    // Append the new ingredient div to the ingredient list
    ingredientList.appendChild(ingredientDiv);

    // Add event listener to the remove button
    const removeBtn = ingredientDiv.querySelector('.remove-ingredient-btn');
    removeBtn.addEventListener('click', () => {
      ingredientList.removeChild(ingredientDiv);
    });
  });
});
