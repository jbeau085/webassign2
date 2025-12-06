const dataUrl = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";
let products = [];
let cart = [];
let filteredList={
    gender: [],
    catagories: [],
    size: [],
    colors: []
};

// Get data from localStorage, if it doesn't exist, fetch it!
function fetchData(){
  const productData = localStorage.getItem("productData");
  if (productData){
    products = JSON.parse(productData);
    // console.dir(products);
  } else {
    fetch(dataUrl)
      .then(resp=>resp.json())
      .then(data=>{
        const jsonData = JSON.stringify(data);
        localStorage.setItem("productData", jsonData);
        products = data;
        // console.dir(products);
    })
    .catch(err=>console.log("Fetch Failed"));
  }
};

// Generate the browse grid
function generateGrid(products){
  const template = document.querySelector("#productTemplate");
  const grid = document.querySelector("#productGrid");
  grid.replaceChildren();
  for (p of products){
    const newGrid = template.content.cloneNode(true);
    newGrid.querySelector(".title").textContent = p.name;
    newGrid.querySelector(".price").textContent = p.price;
    grid.appendChild(newGrid);
  }
};

// When you click on a filter, alter the filter array
function filterMaker(e){
  const pickGender = [...document.querySelectorAll(".filter.gender input[type='checkbox']:checked")];
  filteredList.gender = pickGender.map(checkbox=>checkbox.value);
  console.log(filteredList.gender);

}


// LOAD THE DOM CONTENT HERE
document.addEventListener("DOMContentLoaded", function() {
  fetchData();
  generateGrid(products);    
  const leftBar = document.querySelector(".leftBar");
  leftBar.addEventListener("change",filterMaker);
    // Home
    // Nav Link Handler
    function navHandler(e){
        if (e == "home"){
            document.querySelector("#leftBar").style.display="none";
            document.querySelector("#homeContent").style.display="block";
        } else {
            
        }
    }
    
    // Browse Functions
    // Show list
    //  Gender
    // color
    // Category
    // Size
    // Sort Order
    // Size
    // Add to Cart
    // Click on Product
    // Clear Filter Show everything

    // Single Item View
    // Add to Cart
    // Quant change
    // Color
    // Size

    // Shopping Cart Functions
    // Remove Item
    // Shipping Selector
    // Shipping Method
    // Checkout Button

    

});