const dataUrl = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";
let products = [];
let cart = [];
let filterList = {
    gender: [],
    categories: [],
    size: [],
    colors: []
};

// Get data from localStorage, if it doesn't exist, fetch it!
function fetchData(callback) {
  const productData = localStorage.getItem("productData");
  if (productData) {
    products = JSON.parse(productData);
    if (callback) callback();
  } else {
    fetch(dataUrl)
      .then(resp => resp.json())
      .then(data => {
        localStorage.setItem("productData", JSON.stringify(data));
        products = data;
        if (callback) callback();
      })
      .catch(err => console.log("Fetch Failed", err));
  }
}

// Generate the browse grid
function generateGrid(products) {
  const filteredProducts = buildFilteredList(products, filterList);
  const template = document.querySelector("#productTemplate");
  const grid = document.querySelector("#productGrid");
  grid.replaceChildren();

  filteredProducts.forEach(p => {
    const newGrid = template.content.cloneNode(true);
    newGrid.querySelector(".title").textContent = p.name;
    newGrid.querySelector(".price").textContent = "$" + p.price;
    grid.appendChild(newGrid);
  });
}

// build the filtered list of products
function buildFilteredList(products, filterList) {
  return products.filter(product => {
    if (filterList.gender.length > 0 &&
        !filterList.gender.includes(product.gender.toLowerCase())) {
      return false;
    }
    if (filterList.categories.length > 0 &&
        !filterList.categories.includes(product.category.toLowerCase())) {
      return false;
    }
    if (filterList.size.length > 0 &&
        !product.sizes.some(s => filterList.size.includes(s))) {
      return false;
    }
    if (filterList.colors.length > 0 &&
        !product.color.some(c => filterList.colors.includes(c.name.toLowerCase()))) {
      return false;
    }
    return true;
  });
}

// When you click on a filter, alter the filter array
function filterMaker(e) {
  const pickGender = [...document.querySelectorAll(".filter.gender input[type='checkbox']:checked")];
  filterList.gender = pickGender.map(cb => cb.value.toLowerCase());

  const pickCategory = [...document.querySelectorAll(".filter.category input[type='checkbox']:checked")];
  filterList.categories = pickCategory.map(cb => cb.value.toLowerCase());

  const pickSize = [...document.querySelectorAll(".filter.size input[type='checkbox']:checked")];
  filterList.size = pickSize.map(cb => cb.value);

  const pickColor = [...document.querySelectorAll(".filter.color input[type='checkbox']:checked")];
  filterList.colors = pickColor.map(cb => cb.value.toLowerCase());

  generateGrid(products);
}

// LOAD THE DOM CONTENT HERE
document.addEventListener("DOMContentLoaded", function() {
  fetchData(() => {
    generateGrid(products); // draw initial grid
    const leftBar = document.querySelector(".leftBar");
    leftBar.addEventListener("change", filterMaker);
  });
});
