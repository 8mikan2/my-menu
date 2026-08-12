let cart = [];
const defaultLogo = 'logo.png'; 

// 1. 檢查網址是否有 ?group=... 參數
const urlParams = new URLSearchParams(window.location.search);
const currentGroup = urlParams.get('group');

// 如果沒有指定 group，就顯示「首頁區块」；有的話就顯示「商品區塊」
if (!currentGroup) {
  document.getElementById('home-view').style.display = 'block';
  document.getElementById('shop-view').style.display = 'none';
} else {
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('shop-view').style.display = 'block';
  document.getElementById('group-title').innerText = currentGroup;

  // 讀取 goods.json 載入商品
  fetch('goods.json')
    .then(response => response.json())
    .then(data => {
      const productsData = Array.isArray(data) ? data : (data.products || []);
      const filteredGoods = (currentGroup === '全部分類')
        ? productsData
        : productsData.filter(item => item.group === currentGroup);

      renderProducts(filteredGoods);
    })
    .catch(error => {
      console.error('讀取 JSON 失敗：', error);
      document.getElementById('product-list').innerHTML = '<p>商品載入失敗！</p>';
    });
}

// 2. 渲染商品卡片
function renderProducts(products) {
  const container = document.getElementById('product-list');
  if (products.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">這個分類目前沒有商品喔！</p>';
    return;
  }

  container.innerHTML = products.map(item => {
    const imgSrc = (item.image && item.image.trim() !== "") ? item.image : defaultLogo;
    return `
      <div class="product-card">
        <img src="${imgSrc}" alt="${item.name}">
        <h3>${item.name}</h3>
        <div class="price">$${item.price}</div>
        <button onclick="addToCart('${item.id}', '${item.name}', ${item.price})">加入購物車</button>
      </div>
    `;
  }).join('');
}

// 3. 購物車邏輯
function addToCart(id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  updateCart();
}

function updateCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  document.getElementById('cart-count').innerText = totalQty;
  document.getElementById('cart-total').innerText = totalPrice;

  const cartBody = document.getElementById('cart-items');
  if (cart.length === 0) {
    cartBody.innerHTML = '<p style="text-align:center; color:#999;">購物車是空的</p>';
  } else {
    cartBody.innerHTML = cart.map(item => `
      <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
        <span>${item.name} x ${item.qty}</span>
        <span>$${item.price * item.qty}</span>
      </div>
    `).join('');
  }
}

function toggleCart() {
  const modal = document.getElementById('cart-modal');
  modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

function checkout() {
  if (cart.length === 0) {
    alert('購物車還是空的喔！');
    return;
  }

  let orderText = "你好！我想訂購以下商品：\n";
  cart.forEach(item => {
    orderText += `• ${item.name} x ${item.qty} ($${item.price * item.qty})\n`;
  });
  
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  orderText += `\n總計金額：$${totalPrice}\n感謝！`;

  navigator.clipboard.writeText(orderText).then(() => {
    alert("已自動複製訂單文字！按下確定後將引導至 LINE，請直接貼上訊息給官方帳號。");
    window.open('https://line.me', '_blank');
  });
}
