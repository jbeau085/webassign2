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
    newGrid.querySelector(".price").textContent = "$" + p.price.toFixed(2);
    newGrid.querySelector(".title").addEventListener("click", ()=>showSingleItem(p.id));
    newGrid.querySelector(".thumbnail").addEventListener("click", () => showSingleItem(p.id));
    grid.appendChild(newGrid);
  });
};
// generate filters in the worst possible way.
function generateFilters(products){
  const categoryList = document.querySelector("#categoryList");
  const sizeList = document.querySelector("#sizeList");
  const colorList = document.querySelector("#colorList");
  categoryList.replaceChildren();
  sizeList.replaceChildren();
  colorList.replaceChildren();

  const firstCategory = document.createElement("option");
  firstCategory.value="everything";
  firstCategory.textContent="Everything";
  categoryList.appendChild(firstCategory);

  const firstSize = document.createElement("option");
  firstSize.value="everything";
  firstSize.textContent="Everything";
  sizeList.appendChild(firstSize);

  const firstColor = document.createElement("option");
  firstColor.value="everything";
  firstColor.textContent="Everything";
  colorList.appendChild(firstColor);

  const catList = [];
  const sList = [];
  const cList = [];

  products.forEach(p=>{
    if (!catList.includes(p.category)){
      catList.push(p.category);
      const option = document.createElement("option");
      option.value = p.category.toLowerCase();
      option.textContent = p.category;
      categoryList.append(option);
    }

    p.sizes.forEach(s=>{
      if (!sList.includes(s)){
        sList.push(s);
        const option = document.createElement("option");
        option.value = s.toUpperCase();
        option.textContent = s;
        sizeList.appendChild(option);
      }
    });

    p.color.forEach(c=>{
      if (!cList.includes(c.name)){
        cList.push(c.name);
        const option = document.createElement("option");
        option.value = c.name.toLowerCase();
        option.textContent = c.name;
        colorList.appendChild(option);
      }
    });
  });

}
// filtermaker gets event information from leftBar and applies the filters
function filterMaker(e) {
  const pickGender = [...document.querySelectorAll(".filter.gender input[type='checkbox']:checked")];
  filterList.gender = pickGender.map(cb => cb.value.toLowerCase());

  const pickCategory = document.querySelector("#categoryList");
  const pickedCategory = pickCategory.value;
  filterList.categories = pickedCategory === "everything" ? [] : [pickedCategory.toLowerCase()];

  const pickSize = document.querySelector("#sizeList");
  const pickedSize = pickSize.value;
  filterList.size = pickedSize === "everything" ? [] : [pickedSize.toUpperCase()];

  const pickColor = document.querySelector("#colorList");
  const pickedColor = pickColor.value;
  filterList.colors = pickedColor === "everything" ? [] : [pickedColor.toLowerCase()];

  filteredProducts = buildFilteredList(products, filterList);
  generateGrid(filteredProducts);
}
// Function to build the filtered list of products
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
        !product.sizes.some(s => filterList.size.includes(s.toUpperCase()))) {
      return false;
    }
    if (filterList.colors.length > 0 &&
        !product.color.some(c => filterList.colors.includes(c.name.toLowerCase()))) {
      return false;
    }
    return true;
  });
}
// Filter clear button
function clearFilters(){
  const checkboxes = document.querySelectorAll(".filter.gender input[type='checkbox']");
  checkboxes.forEach(box => {
    box.checked = false;
  });
  document.querySelector("#categoryList").value = "everything";
  document.querySelector("#sizeList").value = "everything";
  document.querySelector("#colorList").value = "everything";
}
// view switchieBoi will change the boxes that appear.
function switchieBoi(viewBox){
  const mainContainer = document.querySelector(".mainContainer");
  const leftBar = document.querySelector(".leftBar");
  const browseBox = document.querySelector("#browseBox");
  const homeBox = document.querySelector("#homeBox");
  const singleItem = document.querySelector("#singleItem");
  const cartBox = document.querySelector("#cartBox");
  const modal = document.querySelector("#aboutModal");
  if (viewBox === "about"){
    // Mostly from here and the lab https://www.w3schools.com/howto/howto_css_modals.asp
    modal.style.display="block";
    document.querySelector("#closeBtn").addEventListener("click", ()=>{
      modal.style.display="none";
    })
  } else{
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
      buildCartView();
    }
  }
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
    newGrid.querySelector(".price").textContent = "$" + g.price.toFixed(2);
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
  item.price = Number(product.price);
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
      entry.total = entry.price * entry.quantity;
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
  salesToast(entry.name);
  // console.dir(cartContent);
  // console.log(cartTotal);
  // https://sebhastian.com/javascript-sum-array-objects reduce. IDK if this was covered in our notes.
  const totalQuantity = cartContent.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cartCount").textContent = totalQuantity;
  // updateCart();
}
// Okay I have a cart view, I guess now I'll load items into the cart view thing
function buildCartView(){
  const cartList = document.querySelector("#cartList");
  cartList.innerHTML="";
  cartContent.forEach(c=>{
    // item, color, size, quant subtotal
    const tr = document.createElement("tr");
    const item = document.createElement("td");
    const color = document.createElement("td");
    const size = document.createElement("td");
    const quant = document.createElement("td");
    const subtotal = document.createElement("td");
    item.textContent = c.name;
    console.log(c.name);
    tr.appendChild(item);
    color.textContent=c.color;
    console.log(c.color);
    tr.appendChild(color);
    size.textContent=c.size;
    console.log(c.size);
    tr.appendChild(size);
    quant.textContent=c.quantity;
    console.log(c.quantity);
    tr.appendChild(quant);
    subtotal.textContent="$" + c.total.toFixed(2);
    console.log(c.total);
    tr.appendChild(subtotal);
    cartList.appendChild(tr);
  })
  const merch = document.querySelector("#merch");
  merch.textContent="$" + cartTotal.toFixed(2);
}
// haha I'm not finishing this
function shippingHandler(){
  const shipCost = document.querySelector("#shipCost");

}
// Make a toast apear when you buy a thing
function salesToast(product){
  const bar = document.querySelector("#snackBar");
  bar.className = "show";
  bar.textContent= product + " added to the cart!";
  setTimeout(()=>{
    bar.className="";
  }, 2000);

}

// LOAD THE DOM CONTENT HERE
document.addEventListener("DOMContentLoaded", function() {
  fetchData(() => {
    filteredProducts = buildFilteredList(products, filterList);
    generateGrid(filteredProducts); 
    const leftBar = document.querySelector(".leftBar");
    leftBar.addEventListener("change", filterMaker);
    document.querySelector(".clearBtn").addEventListener("click", clearFilters);
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
