const products = [
  { id: 1, name: "Martillo Carpintero", category: "Herramientas", price: 8990, icon: "🔨" },
  { id: 2, name: "Taladro Percutor", category: "Herramientas", price: 39990, icon: "🛠️" },
  { id: 3, name: "Juego Destornilladores", category: "Herramientas", price: 12990, icon: "🪛" },
  { id: 4, name: "Cinta Métrica 5 m", category: "Herramientas", price: 5990, icon: "📏" },
  { id: 5, name: "Pintura Interior", category: "Pintura", price: 24990, icon: "🎨" },
  { id: 6, name: "Rodillo Profesional", category: "Pintura", price: 6990, icon: "🖌️" },
  { id: 7, name: 'Brocha 3"', category: "Pintura", price: 3990, icon: "🖌️" },
  { id: 8, name: "Tarugo + Tornillo", category: "Construcción", price: 990, icon: "🔩" },
  { id: 9, name: "Guantes de Trabajo", category: "Seguridad", price: 2990, icon: "🧤" },
  { id: 10, name: "Cable Eléctrico", category: "Electricidad", price: 15990, icon: "⚡" },
  { id: 11, name: "Enchufe Doble", category: "Electricidad", price: 4490, icon: "🔌" },
  { id: 12, name: "Llave de Paso", category: "Gasfitería", price: 5990, icon: "🔧" }
];

const comparisons = [
  { name: "Martillo Carpintero", laQuirpa: 8990, reference: 10990 },
  { name: "Taladro Percutor", laQuirpa: 39990, reference: 44990 },
  { name: "Juego Destornilladores", laQuirpa: 12990, reference: 14990 },
  { name: "Cinta Métrica 5 m", laQuirpa: 5990, reference: 6990 },
  { name: "Rodillo Profesional", laQuirpa: 6990, reference: 7990 }
];

let budget = [];

const money = value => new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
}).format(value);

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = products.map(p => `
    <article class="product">
      <div class="product-icon">${p.icon}</div>
      <div class="product-body">
        <span class="product-tag">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="product-price">${money(p.price)}</div>
        <button class="btn btn-primary add-product" data-id="${p.id}">Agregar al presupuesto</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".add-product").forEach(btn => {
    btn.addEventListener("click", () => addToBudget(Number(btn.dataset.id), 1));
  });
}

function renderComparisons() {
  document.getElementById("comparisonBody").innerHTML = comparisons.map(item => {
    const diff = item.reference - item.laQuirpa;
    const pct = Math.round((diff / item.reference) * 100);
    return `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td><strong>${money(item.laQuirpa)}</strong></td>
        <td>${money(item.reference)}</td>
        <td class="saving">${money(diff)} (${pct}%)</td>
      </tr>
    `;
  }).join("");
}

function loadSelect() {
  const select = document.getElementById("productSelect");
  select.innerHTML = products.map(p =>
    `<option value="${p.id}">${p.name} — ${money(p.price)}</option>`
  ).join("");
}

function addToBudget(id, quantity) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = budget.find(item => item.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    budget.push({ ...product, quantity });
  }
  renderBudget();
  document.getElementById("presupuesto").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderBudget() {
  const list = document.getElementById("budgetList");

  if (!budget.length) {
    list.innerHTML = '<div class="empty">Aún no has agregado productos.</div>';
  } else {
    list.innerHTML = budget.map(item => `
      <div class="budget-row">
        <div><strong>${item.name}</strong><small>${money(item.price)} c/u</small></div>
        <input class="qty" data-id="${item.id}" type="number" min="1" value="${item.quantity}">
        <strong>${money(item.price * item.quantity)}</strong>
        <button class="remove" data-remove="${item.id}" aria-label="Eliminar">×</button>
      </div>
    `).join("");

    list.querySelectorAll(".qty").forEach(input => {
      input.addEventListener("change", () => {
        const item = budget.find(x => x.id === Number(input.dataset.id));
        const qty = Math.max(1, Number(input.value) || 1);
        if (item) item.quantity = qty;
        renderBudget();
      });
    });

    list.querySelectorAll(".remove").forEach(btn => {
      btn.addEventListener("click", () => {
        budget = budget.filter(x => x.id !== Number(btn.dataset.remove));
        renderBudget();
      });
    });
  }

  const subtotal = budget.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("tax").textContent = money(tax);
  document.getElementById("total").textContent = money(total);
}

function sendBudget() {
  if (!budget.length) {
    alert("Agrega al menos un producto al presupuesto.");
    return;
  }

  const subtotal = budget.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax;

  const lines = budget.map(item =>
    `• ${item.name} x${item.quantity}: ${money(item.price * item.quantity)}`
  );

  const message = [
    "Hola La Quirpa, quiero consultar este presupuesto:",
    "",
    ...lines,
    "",
    `Subtotal: ${money(subtotal)}`,
    `IVA 19%: ${money(tax)}`,
    `Total referencial: ${money(total)}`,
    "",
    "Por favor confirmar disponibilidad y precio vigente."
  ].join("\n");

  window.open(`https://wa.me/56971462338?text=${encodeURIComponent(message)}`, "_blank");
}

function printBudget() {
  if (!budget.length) {
    alert("Agrega al menos un producto al presupuesto.");
    return;
  }

  const subtotal = budget.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax;

  const rows = budget.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${money(item.price)}</td>
      <td>${money(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  const win = window.open("", "_blank");
  win.document.write(`
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Presupuesto - Ferretería La Quirpa</title>
      <style>
        body{font-family:Arial,sans-serif;margin:40px;color:#182033}
        img{width:280px}.top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #f58213;padding-bottom:20px}
        table{width:100%;border-collapse:collapse;margin-top:30px}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}
        .total{margin-top:25px;text-align:right;font-size:20px}.orange{color:#f58213}
      </style>
    </head>
    <body>
      <div class="top">
        <img src="${location.href.replace(/[^/]*$/, "logoqp.png")}" alt="La Quirpa">
        <div>Fecha: ${new Date().toLocaleDateString("es-CL")}</div>
      </div>
      <h1>Presupuesto referencial</h1>
      <table>
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">
        Subtotal: ${money(subtotal)}<br>
        IVA 19%: ${money(tax)}<br>
        <strong class="orange">TOTAL: ${money(total)}</strong>
      </div>
      <p>Ferretería La Quirpa · Volcán Llaima 795, Local 8, Talagante · 9 7146 2338</p>
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

document.getElementById("addProduct").addEventListener("click", () => {
  const id = Number(document.getElementById("productSelect").value);
  const quantity = Math.max(1, Number(document.getElementById("quantityInput").value) || 1);
  addToBudget(id, quantity);
});

document.getElementById("sendBudget").addEventListener("click", sendBudget);
document.getElementById("printBudget").addEventListener("click", printBudget);
document.getElementById("clearBudget").addEventListener("click", () => {
  budget = [];
  renderBudget();
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => document.getElementById("mainNav").classList.remove("open"));
});

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderComparisons();
loadSelect();
renderBudget();
