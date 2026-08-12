let cart = [];
const defaultLogo = 'logo.png'; 

const urlParams = new URLSearchParams(window.location.search);
const currentView = urlParams.get('view');
const currentGroup = urlParams.get('group');

// 判斷要顯示哪一個頁面：
// 1. 如果有 group 參數 ➔ 顯示「單一團購商品頁」
// 2. 如果 view === 'catalog' ➔ 顯示「最新開團總覽頁」
// 3. 其他 ➔ 顯示「首頁連結頁」

if (currentGroup) {
  showPage('shop-view');
  loadShopData(currentGroup);
} else if (currentView === 'catalog') {
  showPage('catalog-view');
  loadCatalogData();
} else {
  showPage('home-view');
}

function showPage(pageId) {
  document.getElementById('home-view').style.display = (pageId === 'home-view') ? 'block' : 'none';
  document.getElementById('catalog-view').style.display = (pageId === 'catalog-view') ? 'block' : 'none';
  document.getElementById('shop-view').style.display = (pageId === 'shop-view') ? 'block' : 'none';
}

// 載入「最新開團總覽大廳」
function loadCatalogData() {
  fetch('goods.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('group-list');
      const categories = data.categories || {};
      
      let html = '';
      for (let groupName in categories) {
        if (groupName === '全部分類') continue;
        const info = categories[groupName];
        const coverImg = (info.banner && info.banner.trim() !== "") ? info.banner : defaultLogo;

        html += `
          <a href="?group=${encodeURIComponent(groupName)}" class="group-card">
            <img src="${coverImg}" alt="${groupName}">
            <div class="group-name">${groupName}</div>
          </a>
        `;
      }
      container.innerHTML = html || '<p style="text-align:center; grid-column:1/-1;">目前暫無開團活動喔！</p>';
    });
}

// 載入「單一團購商品頁」
function loadShopData(groupName) {
  document.getElementById('group-title').innerText = groupName;

  fetch('goods.json')
    .then(res => res.json())
    .then(data => {
      // 1. 設定頂部公告與大圖
      const catInfo = (data.categories && data.categories[groupName]) ? data.categories[groupName] : {};
      document.getElementById('top-announcement').innerText = catInfo.announcement || '📢 歡迎光臨選購！';
      document.getElementById('banner-img').src = (catInfo.banner && catInfo.banner.trim() !== "") ? catInfo.banner : defaultLogo;

      // 2. 顯示商品
      const productsData = data.products || (Array.isArray(data) ? data : []);
      const filteredGoods = productsData.filter(item => item.group === groupName);

      renderProducts(filteredGoods);
    });
}

function renderProducts(products) {
  const container = document.getElementById('product-list');
  if (products.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">這個團購目前沒有商品喔！</p>';
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
