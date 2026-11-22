let cart = JSON.parse(localStorage.getItem("medyuga_cart") || "[]");
let selectedPacks = {};
let boxSlots = [];
let activeGoal = "all";

document.addEventListener("DOMContentLoaded", () => {
  initBrandInfo();
  renderCatalog();
  initSommelier();
  initBoxBuilder();
  initCartUI();
  updateCartUI();
});

function initBrandInfo() {
  document.getElementById("brand-name").textContent = SITE_CONFIG.brand.name;
  document.getElementById("footer-brand").textContent = SITE_CONFIG.brand.name;
  document.getElementById("hero-meta").textContent = `${SITE_CONFIG.brand.year} • ${SITE_CONFIG.brand.location}`;
  document.getElementById("hero-slogan").textContent = SITE_CONFIG.brand.slogan;
  document.getElementById("footer-loc").textContent = SITE_CONFIG.brand.location;

  const tgUrl = `https://t.me{SITE_CONFIG.contacts.telegramUsername}`;
  document.getElementById("direct-tg-btn").href = tgUrl;
  document.getElementById("footer-tg").href = tgUrl;

  const phoneEl = document.getElementById("footer-phone");
  phoneEl.textContent = SITE_CONFIG.contacts.phoneDisplay;
  phoneEl.href = `tel:${SITE_CONFIG.contacts.phoneRaw}`;

  const deliverySelect = document.getElementById("client-delivery");
  SITE_CONFIG.deliveryMethods.forEach(method => {
    const opt = document.createElement("option");
    opt.value = method;
    opt.textContent = method;
    deliverySelect.appendChild(opt);
  });
}

function getPrice(product, packId) {
  const pack = SITE_CONFIG.packaging.find(p => p.id === packId) || SITE_CONFIG.packaging[0];
  return Math.round((product.basePrice1L * pack.multiplier) / 10) * 10;
}

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = "";

  const items = SITE_CONFIG.products.filter(p => p.inStock && (activeGoal === "all" || p.goal === activeGoal));

  items.forEach(product => {
    if (!selectedPacks[product.id]) selectedPacks[product.id] = SITE_CONFIG.packaging[1] ? SITE_CONFIG.packaging[1].id : SITE_CONFIG.packaging[0].id;
    const currentPackId = selectedPacks[product.id];
    const price = getPrice(product, currentPackId);

    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'" />
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-body">
        <h3>${product.name}</h3>
        <div class="product-meta">${product.region} • Диастаза: ${product.diastase}</div>
        <p class="product-desc"><strong>Вкус:</strong> ${product.taste}<br>${product.description}</p>
        <div class="pack-selector">
          ${SITE_CONFIG.packaging.map(pack => `
            <button type="button" class="pack-btn ${pack.id === currentPackId ? "active" : ""}" data-prod="${product.id}" data-pack="${pack.id}">
              ${pack.label}
              ${pack.badge ? `<span class="pack-badge">${pack.badge}</span>` : ""}
            </button>
          `).join("")}
        </div>
        <div class="product-buy">
          <span class="price-val">${price} ₽</span>
          <button type="button" class="btn-gold add-prod-btn" data-prod="${product.id}">В корзину</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".pack-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPacks[btn.dataset.prod] = btn.dataset.pack;
      renderCatalog();
    });
  });

  grid.querySelectorAll(".add-prod-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const prod = SITE_CONFIG.products.find(p => p.id === btn.dataset.prod);
      const pack = SITE_CONFIG.packaging.find(p => p.id === selectedPacks[prod.id]);
      addToCart({
        key: `${prod.id}_${pack.id}`,
        title: `${prod.name} (${pack.label})`,
        price: getPrice(prod, pack.id),
        qty: 1
      });
    });
  });
}

function initSommelier() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeGoal = btn.dataset.goal;
      renderCatalog();
    });
  });
}

function initBoxBuilder() {
  document.getElementById("box-discount-label").textContent = `${SITE_CONFIG.giftBoxDiscountPercent}%`;
  const optionsWrap = document.getElementById("box-options");
  optionsWrap.innerHTML = "";

  SITE_CONFIG.products.filter(p => p.inStock).forEach(prod => {
    const price05 = getPrice(prod, "05_glass");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "box-opt-btn";
    btn.innerHTML = `<span>+ ${prod.name} (0.5 л)</span><strong>${price05} ₽</strong>`;
    btn.addEventListener("click", () => {
      if (boxSlots.length < 3) {
        boxSlots.push({ id: prod.id, name: prod.name, price: price05 });
        renderBoxSlots();
      }
    });
    optionsWrap.appendChild(btn);
  });

  document.getElementById("add-box-to-cart").addEventListener("click", () => {
    if (boxSlots.length !== 3) return;
    const { finalPrice } = calcBoxPrice();
    const names = boxSlots.map(s => s.name).join(" + ");
    addToCart({
      key: `box_${Date.now()}`,
      title: `Подарочный бокс 3×0.5 л (${names})`,
      price: finalPrice,
      qty: 1
    });
    boxSlots = [];
    renderBoxSlots();
  });

  renderBoxSlots();
}

function calcBoxPrice() {
  const raw = boxSlots.reduce((sum, item) => sum + item.price, 0);
  const discount = (100 - SITE_CONFIG.giftBoxDiscountPercent) / 100;
  const finalPrice = Math.round((raw * discount) / 10) * 10;
  return { raw, finalPrice };
}

function renderBoxSlots() {
  const wrap = document.getElementById("box-slots");
  wrap.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const item = boxSlots[i];
    const div = document.createElement("div");
    div.className = `slot ${item ? "filled" : ""}`;
    if (item) {
      div.innerHTML = `<strong>${item.name}</strong><span>0.5 л</span><button type="button" data-idx="${i}">Убрать</button>`;
    } else {
      div.innerHTML = `<span class="muted">Банка #${i + 1}</span>`;
    }
    wrap.appendChild(div);
  }

  wrap.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      boxSlots.splice(Number(btn.dataset.idx), 1);
      renderBoxSlots();
    });
  });

  const { raw, finalPrice } = calcBoxPrice();
  document.getElementById("box-old-price").textContent = `${raw} ₽`;
  document.getElementById("box-final-price").textContent = `${finalPrice} ₽`;
  document.getElementById("add-box-to-cart").disabled = boxSlots.length !== 3;
}

function addToCart(item) {
  const existing = cart.find(c => c.key === item.key);
  if (existing) existing.qty += 1;
  else cart.push(item);
  saveCart();
  document.getElementById("cart-drawer").classList.add("open");
}

function saveCart() {
  localStorage.setItem("medyuga_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-total").textContent = `${total} ₽`;

  const container = document.getElementById("cart-items");
  if (!cart.length) {
    container.innerHTML = `<p class="muted">Корзина пока пуста. Выберите мёд в каталоге или соберите подарочный бокс.</p>`;
    return;
  }

  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div>
        <strong>${item.title}</strong>
        <div class="muted">${item.price} ₽ × ${item.qty} = ${item.price * item.qty} ₽</div>
      </div>
      <div class="cart-qty">
        <button type="button" onclick="changeQty(${idx}, -1)">-</button>
        <span>${item.qty}</span>
        <button type="button" onclick="changeQty(${idx}, 1)">+</button>
      </div>
    </div>
  `).join("");
}

window.changeQty = function(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
};

function initCartUI() {
  const drawer = document.getElementById("cart-drawer");
  document.getElementById("open-cart-btn").onclick = () => drawer.classList.add("open");
  document.getElementById("close-cart-btn").onclick = () => drawer.classList.remove("open");
  document.getElementById("close-cart-bg").onclick = () => drawer.classList.remove("open");

  document.getElementById("order-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!cart.length) return;

    const name = document.getElementById("client-name").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const delivery = document.getElementById("client-delivery").value;
    const comment = document.getElementById("client-comment").value.trim();
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const lines = cart.map((i, idx) => `${idx + 1}. ${i.title} — ${i.qty} шт. (${i.price * i.qty} ₽)`).join("\n");
    const message = `🍯 НОВЫЙ ЗАКАЗ — МЁД ЮГА\n\n👤 Клиент: ${name}\n📞 Связь: ${phone}\n🚚 Доставка: ${delivery}\n💬 Комментарий: ${comment || "—"}\n\n📦 Состав заказа:\n${lines}\n\n💰 ИТОГО: ${total} ₽`;

    const statusEl = document.getElementById("order-status");
    const submitBtn = document.getElementById("submit-order-btn");
    submitBtn.disabled = true;
    statusEl.textContent = "Отправляем заказ...";

    if (SITE_CONFIG.telegramBot.enabled) {
      try {
        const res = await fetch(`https://telegram.org{SITE_CONFIG.telegramBot.botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: SITE_CONFIG.telegramBot.chatId, text: message })
        });
