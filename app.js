// 儲存購物車裡面的商品
let cart = [];

// 1. 網頁一打開，先看網址有沒有 ?group=分類名稱
const urlParams = new URLSearchParams(window.location.search);
const currentGroup = urlParams.get('group') || '全部分類';

// 改變頂部標題文字
document.getElementById('group-title').innerText = currentGroup;

// 2. 讀取 goods.json 檔案
fetch('goods.json')
  .then(response => response.json())
  .then(data => {
    // 如果網址有指定分類，就過濾商品；如果沒有，就顯示全部
    const filteredGoods = (currentGroup === '全部分類')
      ? data
      : data.filter(item => item.group === currentGroup);

    renderProducts(filteredGoods);
  })
  .catch(error => {
    console.error('讀取 JSON 失敗：', error);
    document.getElementById('product-list').innerHTML = '<p>商品載入失敗，請檢查 goods.json 檔案格式！</p>';
  });

// 3. 把商品畫在網頁上
function renderProducts(products) {
  const container = document.getElementById('product-list');
  
  if (products.length === 0) {
    container.innerHTML = '<p>這個分類目前沒有商品喔！</p>';
    return;
  }

  container.innerHTML = products.map(item => `
    <div class="product-card">
      <img src="${item.image}" alt="${item.name}">
      <h3>${item.name}</h3>
      <div class="price">$${item.price}</div>
      <button onclick="addToCart('${item.id}', '${item.name}', ${item.price})">加入購物車</button>
    </div>
  `).join('');
}

// 4. 按下「加入購物車」的動作
function addToCart(id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  updateCart();
}

// 5. 更新購物車數量與總金額
function updateCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  document.getElementById('cart-count').innerText = totalQty;
  document.getElementById('cart-total').innerText = totalPrice;

  // 渲染購物車裡面的列表
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

// 6. 開啟/關閉購物車視窗
function toggleCart() {
  const modal = document.getElementById('cart-modal');
  modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

// 7. 按下「確認訂購」的動作
function checkout() {
  if (cart.length === 0) {
    alert('購物車還是空的喔！');
    return;
  }

  // 整理文字，準備讓顧客傳送送到 LINE
  let orderText = "你好！我想訂購以下商品：\n";
  cart.forEach(item => {
    orderText += `• ${item.name} x ${item.qty} ($${item.price * item.qty})\n`;
  });
  
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  orderText += `\n總計金額：$${totalPrice}\n感謝！`;

  // 複製文字並跳出提示
  navigator.clipboard.writeText(orderText).then(() => {
    alert("已自動複製訂單文字！按下確定後將引導至 LINE，請直接貼上訊息給官方帳號。");
    // 這裡可以換成你的官方 LINE 連結
    window.open('https://line.me', '_blank');
  });
}