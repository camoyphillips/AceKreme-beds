// main.js

document.addEventListener("DOMContentLoaded", () => {

  // Handle Add to Cart button clicks
  const buyButtons = document.querySelectorAll(".buy-button");
  
  buyButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const productId = e.target.dataset.productId;
      addToCart(productId);
    });
  });

  // Function to add product to cart
  function addToCart(productId) {
    console.log(`Product ${productId} added to cart.`);
    //Show a simple alert 
    alert(`Product ${productId} added to cart.`);
  }

});