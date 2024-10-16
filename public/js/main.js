$(document).ready(function () {
  // New recipe form submission
  $('#new-recipe-form').on('submit', function (e) {
    e.preventDefault();
    const recipeName = $('#recipeName').val();
    const ingredientName = $('#ingredient').val();
    const ingredientQuantity = $('#quantity').val();
    const ingredientUnit = $('#unit').val();

    $.post('/recipes', {
      recipeName,
      ingredientName: [ingredientName],
      ingredientQuantity: [ingredientQuantity],
      ingredientUnit: [ingredientUnit]
    }).done(function () {
      alert('Recipe added successfully!');
      location.reload(); // Reload the page to update the recipe list
      $('#new-recipe-form')[0].reset(); // Reset form
    }).fail(function () {
      alert('Error adding recipe');
    });
  });
});
