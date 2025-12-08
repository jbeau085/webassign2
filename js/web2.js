const dataUrl = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";
let products = [];
let cartContent = [];
let cartCount = 0;
let cartTotal = 0;
let filterList = {
    gender: [],
    categories: [],
    size: [],
    colors: []
};
  let filteredProducts = [];


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
};

// Generate the browse grid
function generateGrid(products) {
  const template = document.querySelector("#productTemplate");
  const grid = document.querySelector("#productGrid");
  grid.replaceChildren();

  products.forEach(p => {
    const newGrid = template.content.cloneNode(true);
    const box = newGrid.querySelector(".box");
    const button = newGrid.querySelector(".add");
    button.dataset.id = p.id;
    button.addEventListener("click", () => {
      const cartItem = makeCartItem(button);
      cartAdd(cartItem);
    })
    newGrid.querySelector(".title").textContent = p.name;
    newGrid.querySelector(".price").textContent = "$" + p.price;
    newGrid.querySelector(".title").addEventListener("click", ()=>showSingleItem(p.id));
    newGrid.querySelector(".thumbnail").addEventListener("click", () => showSingleItem(p.id));
    grid.appendChild(newGrid);
  });
};

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
};

// When you click on a filter, alter the filter array
// basically the same as https://www.geeksforgeeks.org/javascript/how-to-filter-an-array-of-objects-based-on-multiple-properties-in-javascript/

function filterMaker(e) {
  const pickGender = [...document.querySelectorAll(".filter.gender input[type='checkbox']:checked")];
  filterList.gender = pickGender.map(cb => cb.value.toLowerCase());

  const pickCategory = [...document.querySelectorAll(".filter.category input[type='checkbox']:checked")];
  filterList.categories = pickCategory.map(cb => cb.value.toLowerCase());

  const pickSize = [...document.querySelectorAll(".filter.size input[type='checkbox']:checked")];
  filterList.size = pickSize.map(cb => cb.value);

  const pickColor = [...document.querySelectorAll(".filter.color input[type='checkbox']:checked")];
  filterList.colors = pickColor.map(cb => cb.value.toLowerCase());
filteredProducts = buildFilteredList(products, filterList);
  generateGrid(filteredProducts);
}
// let's auto generate some product filters! Yay!
// probably just categories, sizes, and colors
// later I'll make it update when other filters are clicked...?
// yeah right
function generateFilters(products){
  const categoryList = document.querySelector("#categoryList");
  const sizeList = document.querySelector("#sizeList");
  const colorList = document.querySelector("#colorList");
  categoryList.replaceChildren();
  const catList = [];
  const sList =[];
  const cList=[];
  products.forEach(p=>{
    // THERE HAS TO BE A BETTER WAY OF DOING THIS DON'T LEAVE THIS AND DON'T LET VS REFACTOR YOUR CODE AGAIN DUMMY
    if (!catList.includes(p.category)) {
      catList.push(p.category);
      const li = document.createElement("li");
      const checkBox = document.createElement("input");
      checkBox.type = "checkbox";
      checkBox.value=p.category.toLowerCase();
      li.className="checkbox";
      li.textContent=p.category;
      li.appendChild(checkBox);
      categoryList.appendChild(li);
    }
    // generate sizes
    p.sizes.forEach(s=>{
      if (!sList.includes(s)){
        sList.push(s);
        const li = document.createElement("li");
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.value = s;
        li.className="checkbox";
        li.textContent=s;
        li.appendChild(checkBox);
        sizeList.appendChild(li);
      }
      });

    // generate colors

    p.color.forEach(c => {

      if (!cList.includes(c.name)) {
        cList.push(c.name);
        const li = document.createElement("li");
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.value = c.name;
        li.className = "checkbox";
        const swatch = document.createElement("span");
        swatch.className = "color-swatch";
        swatch.style.background = c.hex;
        li.appendChild(checkBox);
        li.appendChild(swatch);
        li.appendChild(document.createTextNode(" " + c.name));
        colorList.appendChild(li);
      }
    });
    }// end product loop
  )};
// view switchieBoi will change the boxes that appear.
function switchieBoi(viewBox){
  const mainContainer = document.querySelector(".mainContainer");
  const leftBar = document.querySelector(".leftBar");
  const browseBox = document.querySelector("#browseBox");
  const homeBox = document.querySelector("#homeBox");
  const singleItem = document.querySelector("#singleItem");
  const cartBox = document.querySelector("#cartBox");
  leftBar.style.display = "none";
  browseBox.style.display = "none";
  homeBox.style.display="none";
  singleItem.style.display="none";
  cartBox.style.display = "none";
  mainContainer.style.gridTemplateColumns = "1fr";
  if (viewBox === "home"){
    homeBox.style.display = "block";
  }else if (viewBox === "browse"){
    browseBox.style.display="block";
    leftBar.style.display = "block";
    mainContainer.style.gridTemplateColumns = "260px 1fr";
  } else if (viewBox === "singleItem"){
    singleItem.style.display = "block";
  } else if (viewBox === "single"){
    singleItem.style.display = "block";
  }else if (viewBox === "cart:"){
    cartBox.style.display="block";
  }
  // }else if (viewBox === "about"){
  //   homeBox.style.display="block";
  //   // Later do the thing
  // }
}
function showSingleItem(productid){
  const product = products.find(p=>p.id === productid);
  if (!product) switchieBoi("home");
  switchieBoi("single");
  const button = document.querySelector("#addToCart");
  button.dataset.id=productid;
  button.addEventListener("click", () => {
      const cartItem = makeCartItem(button);
      cartAdd(cartItem);
    });
  document.querySelector("#itemName").textContent = product.name;
  document.querySelector("#itemPrice").textContent = product.price;
  document.querySelector("#itemDesc").textContent = product.description;
  document.querySelector("#itemMat").textContent = product.material;
  document.querySelector("#singleImageImg").src="./data/shirt.png";

}
// Lets make a grid under home, and make home generate with an image!
// GeeksforGeeks coming in CLUTCH for this project
// https://www.geeksforgeeks.org/javascript/how-to-select-a-random-element-from-array-in-javascript

function makeHome(products){
  const homeGrid = document.querySelector("#homeGrid");
  const randomProducts = [...products].sort(()=> 0.5 - Math.random());
  const theThree = randomProducts.slice(0,3);
  const template = document.querySelector("#productTemplate");
  homeGrid.replaceChildren();
  // reusing this is silly, make sure you change this to a function, then you can call it for relevent items etc.
  theThree.forEach( g => {
    const newGrid = template.content.cloneNode(true);
    const box = newGrid.querySelector(".box");
    box.dataset.product = g.id;
    const button = newGrid.querySelector(".add");
    button.dataset.id = g.id;
    button.addEventListener("click", () => {
      const cartItem = makeCartItem(button);
      cartAdd(cartItem);
    })
    newGrid.querySelector(".title").textContent = g.name;
    newGrid.querySelector(".price").textContent = "$" + g.price;
    newGrid.querySelector(".title").addEventListener("click", ()=>showSingleItem(g.id));
    newGrid.querySelector(".thumbnail").addEventListener("click", () => showSingleItem(g.id));
    homeGrid.appendChild(newGrid);
  })
}
// Add to cart functionality! we're makin' buttons, folks!
function makeCartItem(btn){
  let item = {};
  const product = products.find(p=>p.id === btn.dataset.id);
  item.id = product.id;
  item.price = product.price;
  item.size = product.pickSize || "";
  item.color = product.pickColor || "";
  item.name = product.name;
  item.quantity = 1;
  item.total = item.price * item.quantity;
  return item;
}
// count items and update cart count
function cartAdd(item){
  let entry = null;
  for (let cartItem of cartContent){
    if (cartItem.id == item.id) {
      entry = cartItem;
      entry.quantity++;
      cartCount++;
      cartTotal += item.price;
      break;
    }
  }
  if (!entry) {
    item.quantity = 1;
    cartContent.push(item);
    cartCount++;
    cartTotal+=item.price;
  }
  console.dir(cartContent);
  const totalQuantity = cartContent.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cartCount").textContent = totalQuantity;
  // updateCart();
}


// LOAD THE DOM CONTENT HERE
document.addEventListener("DOMContentLoaded", function() {
  fetchData(() => {
    filteredProducts = buildFilteredList(products, filterList);
    generateGrid(filteredProducts); 
    const leftBar = document.querySelector(".leftBar");
    leftBar.addEventListener("change", filterMaker);
    generateFilters(filteredProducts);
    document.querySelector("#heroImage").style.backgroundImage = 'url("./data/hero.png")';
    makeHome(products);
    switchieBoi("home");
  });

  // Activate switchieboi
  document.querySelector("header").addEventListener("click", e=>{
    if (e.target.tagName !== "A") return;
    const viewBox = e.target.textContent.trim().toLowerCase();
    switchieBoi(viewBox);
  })
});
