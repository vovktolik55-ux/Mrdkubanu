let cart = JSON.parse(localStorage.getItem("medyuga_cart") || "[]");
let selectedPacks = {};
let boxSlots = [];
let activeGoal = "all";

const CARD_GRADIENTS = {
  acacia: "linear-gradient(135deg, #4a3512 0%, #1b1409 100%)",
  chestnut: "linear-gradient(135deg, #3b1c0e 0%, #160c07 100%)",
  linden: "linear-gradient(135deg, #473914 0%, #191509 100%)",
  herbs: "linear-gradient(135deg, #3d2c10 0%, #171208 100%)",
  cream_nuts: "linear-gradient(135deg, #4d3419 0%, #1c130b 100%)"
};

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
  deliverySelect.innerHTML = "";
  SITE_CONFIG.deliveryMethods.forEach(method => {
    const opt = document.createElement("option");
    opt.value = method;
    opt.textContent = method;
    deliverySelect.appendChild(opt);
  });
}

function getDefaultPack() {
  return SITE_CONFIG.packaging.at(0);
}

function getPrice(product, packId) {
  const pack = SITE_CONFIG.packaging.find(p => p.id === packId) || getDefaultPack();
  return Math.round((product.basePrice1L * pack.multiplier) / 10) * 10;
}

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = "";

  const items = SITE_CONFIG.products.filter(p => p.inStock && (activeGoal === "all" || p.goal === activeGoal));

  items.forEach(product => {
    if (!selectedPacks[product.id]) {
      selectedPacks[product.id] = getDefaultPack().id;
    }
    const currentPackId = selectedPacks[product.id];
    const price = getPrice(product, currentPackId);
    const bgStyle = CARD_GRADIENTS[product.id] || "linear-gradient(135deg, #3d2c10 0%, #171208 100%)";

    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-banner" style="background: ${bgStyle};">
        <span class="banner-tag">${product.tag}</span>
        <span class="banner-diastase">Диастаза: ${product.diastase}</span>
        <svg class="hex-pattern" viewBox="0 0 200 160" xmlns="http://w3.org">
          <g stroke="#ffd166" stroke-width="2" fill="rgba(245,176,65,0.18)">
            <polygon points="100,15 130,32 130,66 100,83 70,66 70,32"/>
            <polygon points="68,69 98,86 98,120 68,137 38,120 38,86"/>
            <polygon points="132,69 162,86 162,120 132,137 102,120 102,86"/>
          </g>
        </svg>
      </div>
      <div class="product-content">
        <h3>${product.name}</h3>
        <div class="product-origin">${product.region}</div>
        <p class="product-text"><strong>Вкус:</strong> ${product.taste}<br>${product.description}</p>
        <div class="tare-grid">
          ${SITE_CONFIG.packaging.map(pack => `
            <button type="button" class="tare-btn ${pack.id === currentPackId ? "active" : ""}" data-prod="${product.id}" data-pack="${pack.id}">
              ${pack.label}
              ${pack.badge ? `<span class="tare-badge">${pack.badge}</span>` : ""}
            </button>
          `).join("")}
        </div>
        <div class="product-footer">
          <span class="price-tag">${price} ₽</span>
          <button type="button" class="btn-gold add-prod-btn" data-prod="${product.id}">В корзину</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".tare-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPacks[btn.dataset.prod] = btn.dataset.pack;
      renderCatalog();
    });
  });

  grid.querySelectorAll(".add-prod-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const prod = SITE_CONFIG.products.find(p => p.id === btn.dataset.prod);
      const pack = SITE_CONFIG.packaging.find(p => p.id === selectedPacks[prod.id]) || getDefaultPack();
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
  document.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
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
    btn.className = "picker-item";
    btn.innerHTML = `<span>+ ${prod.name} (0.5 л)</span><strong style="color:var(--gold-light)">${price05} ₽</strong>`;
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
    const item = boxSlots.at(i);
    const div = document.createElement("div");
    div.className = `slot-card ${item ? "filled" : ""}`;
    if (item) {
      div.innerHTML = `<strong>${item.name}</strong><span class="muted">0.5 л</span><button type="button" class="slot-remove" data-idx="${i}">Убрать</button>`;
    } else {
      div.innerHTML = `<span class="muted">Банка #${i + 1}</span>`;
    }
    wrap.appendChild(div);
  }

  wrap.querySelectorAll(".slot-remove").forEach(btn => {
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
    container.innerHTML = `<p class="muted">Корзина пока пуста. Выберите мёд в коллекции или соберите подарочный бокс.</p>`;
    return;
  }

  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-row">
      <div>
        <strong>${item.title}</strong>
        <div class="muted">${item.price} ₽ × ${item.qty} = ${item.price * item.qty} ₽</div>
      </div>
      <div class="qty-box">
        <button type="button" onclick="changeQty(${idx}, -1)">−</button>
        <span>${item.qty}</span>
        <button type="button" onclick="changeQty(${idx}, 1)">+</button>
      </div>
    </div>
  `).join("");
}

window.changeQty = function(idx, delta) {
  const item = cart.at(idx);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.splice(idx, 1);
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
