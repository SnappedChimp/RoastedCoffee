const pages = {
    index: { height: 7396, title: "Головна" },
    katalog: { height: 3680, title: "Каталог" },
    constructor: { height: 4165, title: "Конструктор" },
    contacts: { height: 4827, title: "Контакти" },
    "about-us": { height: 5030, title: "Про нас" },
    services: { height: 5030, title: "Послуги" },
    blog: { height: 3956, title: "Блог" },
    article: { height: 7692, title: "Стаття" }
};

const products = [
    { id: "quiet-morning", name: "Бразилія «Тихий ранок»", price: 420, origin: "Бразилія", method: "Фільтр", roast: "Середнє", weight: "250 г", category: "Зерно" },
    { id: "flower", name: "Ефіопія «Квіткова»", price: 480, origin: "Ефіопія", method: "Фільтр", roast: "Світле", weight: "250 г", category: "Зерно" },
    { id: "velvet", name: "Колумбія «Медова»", price: 450, origin: "Колумбія", method: "Еспресо", roast: "Середнє", weight: "250 г", category: "Заварювання" },
    { id: "dark-roast", name: "Бленд «Оксамит»", price: 390, origin: "Бразилія", method: "Еспресо", roast: "Темне", weight: "250 г", category: "Зерно" },
    { id: "filter-blend", name: "Бленд для фільтра", price: 440, origin: "Бразилія", method: "Фільтр", roast: "Середнє", weight: "500 г", category: "Рецепти" },
    { id: "espresso-blend", name: "Бленд для еспресо", price: 460, origin: "Колумбія", method: "Еспресо", roast: "Темне", weight: "500 г", category: "Обладнання" }
];

const page = document.querySelector("[data-page]");
const artwork = document.querySelector(".page-artwork");
const navigation = document.querySelector(".artwork-navigation");
const pageInfo = pages[page?.dataset.page];
let cart = loadCart();
let selectedBeans = new Set(["quiet-morning", "velvet"]);
const activeFilters = {};
let activeSort = "Рекомендовані";
let dialog;
let previousFocus;
let toastTimer;

if (page && artwork && pageInfo) {
    addCartControl();
    setupMobileMenu();
    setupInteractions();
    setupDialog();
}

function loadCart() {
    try {
        const value = JSON.parse(localStorage.getItem("roasted-coffee-cart") || "[]");
        if (!Array.isArray(value)) {
            throw new TypeError("Saved cart has an invalid format.");
        }
        return value.filter((item) =>
            products.some((product) => product.id === item.id) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        );
    } catch (error) {
        console.error("Unable to read the saved cart.", error);
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem("roasted-coffee-cart", JSON.stringify(cart));
    } catch (error) {
        console.error("Unable to save the shopping cart.", error);
        showToast("Кошик доступний лише до закриття цієї вкладки.");
    }
}

function setupDialog() {
    dialog = document.createElement("div");
    dialog.className = "action-dialog";
    dialog.hidden = true;
    dialog.setAttribute("role", "presentation");
    dialog.innerHTML = `
        <section class="action-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <div class="mb-5 flex items-start justify-between gap-4">
                <h2 id="dialog-title" class="text-2xl font-semibold text-coffee-ink"></h2>
                <button class="action-button min-h-9 px-3" type="button" data-close-dialog aria-label="Закрити">Закрити</button>
            </div>
            <div data-dialog-content></div>
        </section>`;
    document.body.append(dialog);
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog || event.target.closest("[data-close-dialog]")) {
            closeDialog();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !dialog.hidden) closeDialog();
    });
}

function openDialog(title, content) {
    previousFocus = document.activeElement;
    dialog.querySelector("#dialog-title").textContent = title;
    dialog.querySelector("[data-dialog-content]").replaceChildren(content);
    dialog.hidden = false;
    dialog.querySelector("[data-close-dialog]").focus();
}

function closeDialog() {
    dialog.hidden = true;
    previousFocus?.focus?.();
}

function addCartControl() {
    const cartLink = document.createElement("a");
    cartLink.className = "artwork-entry header-cart-entry";
    cartLink.href = "#cart";
    cartLink.style.top = `${(42 / pageInfo.height) * 100}%`;
    cartLink.style.height = `${(66 / pageInfo.height) * 100}%`;
    cartLink.setAttribute("aria-label", `Відкрити кошик, товарів: ${cartCount()}`);
    cartLink.addEventListener("click", (event) => {
        event.preventDefault();
        openCart();
    });
    artwork.append(cartLink);
    cartLink.hidden = page.dataset.page === "index" && window.matchMedia("(max-width: 700px)").matches;
}

function setupMobileMenu() {
    if (!navigation) return;

    const toggle = document.createElement("button");
    toggle.className = "menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Відкрити меню");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span class="sr-only">Відкрити меню</span>';
    artwork.append(toggle);

    const menu = document.createElement("nav");
    menu.className = "absolute right-[4%] top-[4%] z-40 hidden min-w-48 flex-col gap-1 rounded-xl border border-coffee-tan/40 bg-white p-3 shadow-xl";
    menu.setAttribute("aria-label", "Мобільна навігація");
    const links = [
        ["Головна", "index.html"], ["Каталог", "katalog.html"],
        ["Про нас", "about-us.html"], ["Контакти", "contacts.html"],
        ["Блог", "blog.html"], ["Послуги", "services.html"]
    ];
    for (const [label, href] of links) {
        const link = document.createElement("a");
        link.className = "rounded-lg px-4 py-3 text-coffee-ink transition-colors hover:bg-coffee-green hover:text-white focus-visible:outline-3 focus-visible:outline-coffee-tan";
        link.href = href;
        link.textContent = label;
        menu.append(link);
    }
    const cartButton = document.createElement("button");
    cartButton.className = "rounded-lg px-4 py-3 text-left text-coffee-ink transition-colors hover:bg-coffee-green hover:text-white focus-visible:outline-3 focus-visible:outline-coffee-tan";
    cartButton.type = "button";
    cartButton.textContent = `Кошик · ${cartCount()}`;
    cartButton.addEventListener("click", openCart);
    menu.append(cartButton);
    artwork.append(menu);

    const updateMenuVisibility = () => {
        const mobile = window.matchMedia("(max-width: 700px)").matches;
        toggle.hidden = !mobile;
        if (page.dataset.page === "index" && mobile) {
            toggle.style.top = "0.15%";
            toggle.style.height = "0.45%";
            menu.style.top = "0.8%";
        } else {
            toggle.style.top = "";
            toggle.style.height = "";
            menu.style.top = "";
        }
        const cartLink = artwork.querySelector(".header-cart-entry");
        if (cartLink) cartLink.hidden = page.dataset.page === "index" && mobile;
        if (navigation) navigation.classList.toggle("mobile-hidden", mobile);
        if (!mobile) {
            menu.classList.add("hidden");
            toggle.setAttribute("aria-expanded", "false");
        }
    };
    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Відкрити меню" : "Закрити меню");
        menu.classList.toggle("hidden", isOpen);
        menu.classList.toggle("flex", !isOpen);
    });
    window.addEventListener("resize", updateMenuVisibility);
    updateMenuVisibility();
}

function addHit(x, y, width, height, label, onClick, pressed = null, canvas = { width: 1440, height: pageInfo.height }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "interactive-hit";
    button.style.left = `${(x / canvas.width) * 100}%`;
    button.style.top = `${(y / canvas.height) * 100}%`;
    button.style.width = `${(width / canvas.width) * 100}%`;
    button.style.height = `${(height / canvas.height) * 100}%`;
    button.setAttribute("aria-label", label);
    if (pressed !== null) button.setAttribute("aria-pressed", String(pressed));
    button.addEventListener("click", onClick);
    artwork.append(button);
    return button;
}

function setupInteractions() {
    switch (page.dataset.page) {
        case "index":
            const phone = window.matchMedia("(max-width: 700px)").matches;
            const canvas = phone ? { width: 375, height: 12049 } : { width: 1440, height: pageInfo.height };
            const addHomeHit = (x, y, width, height, label, action) =>
                addHit(x, y, width, height, label, action, null, canvas);
            addHomeHit(phone ? 19.5 : 80, phone ? 434.5 : 513, phone ? 133 : 156, phone ? 49 : 55, "Обрати каву", () => {
                window.location.href = "katalog.html";
            });
            if (!phone) {
                addHomeHit(80, 620, 250, 45, "Створити власний мікс", () => {
                    window.location.href = "constructor.html";
                });
                [[207.333, "quiet-morning"], [642, "flower"], [1076.667, "velvet"]].forEach(([x, id]) => {
                    addHomeHit(Number(x), 2349, 156, 55, `Додати до кошика: ${products.find((item) => item.id === id).name}`, () => addToCart(id));
                });
                addHomeHit(80, 2460, 156, 55, "Відкрити весь каталог", () => {
                    window.location.href = "katalog.html";
                });
                addHomeHit(732, 2945, 156, 55, "Дізнатися більше про нас", () => {
                    window.location.href = "about-us.html";
                });
                [[104, "quiet-morning"], [538.667, "flower"], [973.333, "velvet"]].forEach(([x, id]) => {
                    addHomeHit(Number(x), 5395, 156, 55, "Читати статтю в блозі", () => {
                        window.location.href = "article.html";
                    });
                });
                addHomeHit(80, 5506, 156, 55, "Перейти до блогу", () => {
                    window.location.href = "blog.html";
                });
                addHomeHit(128, 6416, 156, 55, "Підібрати каву", () => openContactForm("Підбір кави"));
                addHomeHit(880, 6817, 156, 55, "Запитати про каву", () => openContactForm());
            } else {
                [[109.5, 2698], [109.5, 3416], [109.5, 4134]].forEach(([x, y], index) => {
                    addHomeHit(x, y, 156, 55, `Додати каву до кошика, позиція ${index + 1}`, () => addToCart(products[index].id));
                });
                addHomeHit(20, 4245, 143, 48, "Переглянути каталог", () => {
                    window.location.href = "katalog.html";
                });
                addHomeHit(19.5, 5121.5, 152, 49, "Дізнатися більше про нас", () => {
                    window.location.href = "about-us.html";
                });
                [[43.5, 7934.5], [43.5, 8525.5], [43.5, 9091.5]].forEach(([x, y]) => {
                    addHomeHit(x, y, 149, 49, "Читати статтю в блозі", () => {
                        window.location.href = "article.html";
                    });
                });
                addHomeHit(19.5, 9195.5, 131, 49, "Перейти до блогу", () => {
                    window.location.href = "blog.html";
                });
                addHomeHit(43.5, 10455.5, 183, 49, "Перейти до каталогу", () => {
                    window.location.href = "katalog.html";
                });
                addHomeHit(19.5, 11044.5, 336, 49, "Зв'язатися з нами", () => openContactForm());
            }
            break;
        case "katalog":
            setupCatalog();
            break;
        case "constructor":
            setupConstructor();
            break;
        case "contacts":
            setupContactForm();
            addHit(78, 1060, 250, 50, "Написати нам", () => openContactForm());
            addHit(78, 1180, 360, 55, "Відкрити форму зворотного зв'язку", () => openContactForm());
            addHit(723, 2403, 201, 50, "Запитати про замовлення", () => openContactForm("Запит про замовлення"));
            addHit(755, 3107, 223, 50, "Зв'язатися з нами", () => openContactForm());
            addHit(128, 3533, 171, 48, "Поставити запитання", () => openContactForm());
            break;
        case "about-us":
        case "services":
            addHit(128, 3736, 205, 48, "Зв'язатися з нами", () => openContactForm(page.dataset.page === "services" ? "Запит про послуги" : "Зв'язатися з нами"));
            break;
        case "blog":
            setupBlog();
            break;
        case "article":
            addHit(328.5, 5258, 156, 55, "Поділитися статтею", shareArticle);
            [[103.5, 6030.5], [538.167, 6030.5], [972.833, 6005.5]].forEach(([x, y]) => {
                addHit(x, y, 149, 49, "Переглянути інші статті", () => {
                    window.location.href = "blog.html";
                });
            });
            addHit(879.25, 6359.25, 134.5, 49.5, "Повернутися до блогу", () => {
                window.location.href = "blog.html";
            });
            break;
        default:
            break;
    }
}

function setupCatalog() {
    const filterChoices = [
        { key: "method", label: "Метод заварювання", values: ["Усі методи", "Еспресо", "Фільтр"] },
        { key: "origin", label: "Походження", values: ["Усі країни", "Бразилія", "Колумбія", "Ефіопія"] },
        { key: "roast", label: "Обсмажування", values: ["Усі профілі", "Світле", "Середнє", "Темне"] },
        { key: "weight", label: "Вага", values: ["Будь-яка вага", "250 г", "500 г"] }
    ];
    filterChoices.forEach((filter, index) => {
        addHit(79.5, 676 + index * 114, 261, 49, `Змінити фільтр: ${filter.label}`, () => {
            const content = document.createElement("div");
            content.className = "grid gap-4";
            const label = document.createElement("label");
            label.className = "grid gap-1 text-sm font-medium";
            label.textContent = filter.label;
            const select = document.createElement("select");
            select.className = "action-input";
            select.innerHTML = filter.values.map((value) =>
                `<option value="${value}">${value}</option>`
            ).join("");
            label.append(select);
            content.append(label);
            select.value = activeFilters[filter.key] || filter.values[0];
            select.addEventListener("change", () => {
                activeFilters[filter.key] = select.value;
                content.querySelector("[data-product-results]")?.replaceWith(renderProductList());
                showToast(`Фільтр «${filter.label}» застосовано.`);
            });
            content.append(renderProductList());
            openDialog(`Фільтр: ${filter.label}`, content);
        });
    });
    addHit(1095, 676, 285, 49, "Змінити сортування", () => {
        const content = document.createElement("div");
        content.className = "grid gap-4";
        const label = document.createElement("label");
        label.className = "grid gap-1 text-sm font-medium";
        label.textContent = "Сортувати за";
        const select = document.createElement("select");
        select.className = "action-input";
        select.innerHTML = ["Рекомендовані", "Ціною: від дешевих", "Ціною: від дорожчих", "Назвою"]
            .map((value) => `<option>${value}</option>`).join("");
        select.value = activeSort;
        label.append(select);
        content.append(label, renderProductList());
        select.addEventListener("change", () => {
            activeSort = select.value;
            content.querySelector("[data-product-results]")?.replaceWith(renderProductList());
        });
        openDialog("Сортування товарів", content);
    });

    addHit(79.5, 1239, 167, 49, "Очистити фільтри", () => {
        Object.keys(activeFilters).forEach((key) => delete activeFilters[key]);
        activeSort = "Рекомендовані";
        showToast("Фільтри очищено.");
    });
    const purchaseButtons = [
        [444, 1314], [784, 1314], [1124, 1314],
        [444, 2024], [784, 2024], [1124, 2024]
    ];
    purchaseButtons.forEach(([x, y], index) => {
        const product = products[index];
        addHit(x - 75, y, 150, 58, `Додати до кошика: ${product.name}`, () => addToCart(product.id));
    });
}

function renderProductList() {
    const list = document.createElement("ul");
    list.className = "grid gap-2";
    list.dataset.productResults = "true";
    let matches = products.filter((product) =>
        (!activeFilters.method || activeFilters.method.startsWith("Усі") || product.method === activeFilters.method) &&
        (!activeFilters.origin || activeFilters.origin.startsWith("Усі") || product.origin === activeFilters.origin) &&
        (!activeFilters.roast || activeFilters.roast.startsWith("Усі") || product.roast === activeFilters.roast) &&
        (!activeFilters.weight || activeFilters.weight.startsWith("Будь-яка") || product.weight === activeFilters.weight)
    );
    if (activeSort === "Ціною: від дешевих") matches = [...matches].sort((a, b) => a.price - b.price);
    if (activeSort === "Ціною: від дорожчих") matches = [...matches].sort((a, b) => b.price - a.price);
    if (activeSort === "Назвою") matches = [...matches].sort((a, b) => a.name.localeCompare(b.name, "uk"));
    if (matches.length === 0) {
        const empty = document.createElement("li");
        empty.className = "py-3 text-sm text-coffee-ink/70";
        empty.textContent = "За цими фільтрами товарів не знайдено.";
        list.append(empty);
        return list;
    }
    matches.forEach((product) => {
        const row = document.createElement("li");
        row.className = "flex flex-wrap items-center justify-between gap-2 border-b border-coffee-tan/30 py-2";
        const name = document.createElement("span");
        name.className = "text-sm";
        name.textContent = `${product.name} · ${product.price} грн`;
        row.append(name, button("Додати", () => addToCart(product.id)));
        list.append(row);
    });
    return list;
}

function setupConstructor() {
    const positions = [[80, 748], [515, 748], [950, 748]];
    const controls = new Map();
    const toggleBean = (product) => {
        if (selectedBeans.has(product.id)) {
            selectedBeans.delete(product.id);
        } else if (selectedBeans.size < 3) {
            selectedBeans.add(product.id);
        } else {
            showToast("Для міксу можна обрати до трьох сортів.");
            return;
        }
        controls.get(product.id).forEach((control) => {
            const selected = selectedBeans.has(product.id);
            control.setAttribute("aria-pressed", String(selected));
            control.setAttribute("aria-label", `${selected ? "Вилучити" : "Обрати"} зерно: ${product.name}`);
        });
        showToast(selectedBeans.has(product.id) ? `${product.name} додано до міксу.` : `${product.name} вилучено з міксу.`);
    };
    positions.forEach(([x, y], index) => {
        const product = products[index];
        const card = addHit(x, y, 410, 900, `Обрати зерно: ${product.name}`, () => toggleBean(product), selectedBeans.has(product.id));
        controls.set(product.id, [card]);
    });
    [[214.667, 1573.5], [649, 1568.5], [1083.33, 1573.5]].forEach(([x, y], index) => {
        const product = products[index];
        const control = addHit(x, y, 142, 49, `Обрати зерно: ${product.name}`, () => toggleBean(product), selectedBeans.has(product.id));
        controls.get(product.id).push(control);
    });
    addHit(1023.5, 3019.5, 313, 49, "Додати створений мікс до кошика", () => {
        if (selectedBeans.size === 0) {
            showToast("Оберіть хоча б один сорт, щоб продовжити.");
            return;
        }
        const content = document.createElement("div");
        content.className = "grid gap-4";
        content.innerHTML = `
            <label class="grid gap-1 text-sm font-medium">Спосіб заварювання<select class="action-input" name="method"><option>Фільтр</option><option>Еспресо</option><option>Гейзер</option><option>Френч-прес</option></select></label>
            <label class="grid gap-1 text-sm font-medium">Обсмажування<select class="action-input" name="roast"><option>Середнє</option><option>Світле</option><option>Темне</option></select></label>
            <p class="text-sm text-coffee-ink/70" data-blend-summary></p>`;
        content.querySelector("[data-blend-summary]").textContent =
            `Вибрано: ${[...selectedBeans].map((id) => products.find((product) => product.id === id).name).join(", ")}.`;
        content.append(button("Додати мікс до кошика", () => {
            const method = content.querySelector('[name="method"]').value;
            const roast = content.querySelector('[name="roast"]').value;
            addToCart("filter-blend", `Власний мікс · ${method} · ${roast}`);
            closeDialog();
        }));
        openDialog("Налаштуйте свій мікс", content);
    });
}

function setupBlog() {
    const tags = ["Усі матеріали", "Заварювання", "Зерно", "Рецепти", "Культура", "Обладнання"];
    tags.forEach((tag, index) => {
        const tagButton = addHit(78 + index * 120, 570, 112, 38, `Показати категорію: ${tag}`, (event) => {
            artwork.querySelectorAll("[data-blog-tag]").forEach((element) => {
                element.setAttribute("aria-pressed", "false");
            });
            event.currentTarget.dataset.blogTag = "true";
            event.currentTarget.setAttribute("aria-pressed", "true");
            const allArticles = [
                ["V60 вдома: простий рецепт для чистого смаку", "Заварювання"],
                ["Як читати смакові ноти на пакеті", "Зерно"],
                ["Гейзер без гіркоти: п’ять простих кроків", "Рецепти"],
                ["Як підібрати помел", "Обладнання"],
                ["Культура повільної кави", "Культура"],
                ["Рецепти для ранку", "Рецепти"]
            ];
            const matching = tag === "Усі матеріали"
                ? allArticles
                : allArticles.filter((article) => article[1] === tag);
            const content = document.createElement("div");
            content.className = "grid gap-3";
            if (matching.length === 0) {
                const empty = document.createElement("p");
                empty.textContent = "У цій категорії поки немає матеріалів.";
                content.append(empty);
            }
            matching.forEach(([title, category]) => {
                const row = document.createElement("div");
                row.className = "flex flex-wrap items-center justify-between gap-2 border-b border-coffee-tan/30 pb-3";
                const heading = document.createElement("p");
                heading.className = "text-sm font-medium";
                heading.textContent = `${title} · ${category}`;
                row.append(heading, button("Читати", () => {
                    window.location.href = "article.html";
                }));
                content.append(row);
            });
            openDialog(`Блог · ${tag}`, content);
        });
        tagButton.dataset.blogTag = "true";
        tagButton.setAttribute("aria-pressed", "false");
    });
    [
        [103.5, 1158.5], [538.167, 1158.5], [972.833, 1158.5],
        [103.5, 1699.5], [538.167, 1724.5], [972.833, 1699.5]
    ].forEach(([x, y]) => addHit(x, y, 149, 49, "Читати статтю", () => {
        window.location.href = "article.html";
    }));
    addHit(127.5, 2229.5, 223, 49, "Підписатися на блог", () => openContactForm("Підписка на блог"));
    addHit(879.25, 2623.25, 134.5, 49.5, "Поставити запитання автору", () => openContactForm("Запитання про каву"));
}

function setupContactForm() {
    if (window.matchMedia("(max-width: 700px)").matches) {
        addHit(731, 1870, 218, 48, "Відкрити форму повідомлення", () => openContactForm());
        return;
    }
    const form = document.createElement("form");
    form.className = "pointer-events-none absolute inset-0 z-20";
    const fields = [
        { name: "name", label: "Ім'я", type: "text", x: 730.5, y: 1367.5, width: 606, height: 48, required: true },
        { name: "email", label: "Електронна пошта", type: "email", x: 730.5, y: 1464.5, width: 606, height: 48, required: true },
        { name: "phone", label: "Телефон", type: "tel", x: 730.5, y: 1561.5, width: 606, height: 49, required: false },
        { name: "message", label: "Повідомлення", type: "textarea", x: 730.5, y: 1659.5, width: 606, height: 161, required: true }
    ];
    for (const field of fields) {
        const input = document.createElement(field.type === "textarea" ? "textarea" : "input");
        input.className = "action-input pointer-events-auto absolute border-transparent bg-transparent focus:bg-white";
        input.style.left = `${(field.x / 1440) * 100}%`;
        input.style.top = `${(field.y / pageInfo.height) * 100}%`;
        input.style.width = `${(field.width / 1440) * 100}%`;
        input.style.height = `${(field.height / pageInfo.height) * 100}%`;
        input.style.margin = "0";
        input.style.minHeight = "0";
        input.style.padding = "0.5rem 0.75rem";
        input.style.boxSizing = "border-box";
        if (field.type === "textarea") input.style.resize = "none";
        if (field.type !== "textarea") input.type = field.type;
        input.name = field.name;
        input.setAttribute("aria-label", field.label);
        input.autocomplete = field.name === "phone" ? "tel" : field.name === "message" ? "off" : field.name;
        input.required = field.required;
        input.maxLength = field.name === "message" ? 2000 : 200;
        input.addEventListener("focus", () => {
            input.style.backgroundColor = "#FFFCF8";
        });
        input.addEventListener("blur", () => {
            input.style.backgroundColor = input.value ? "#FFFCF8" : "transparent";
        });
        form.append(input);
    }
    const submit = document.createElement("button");
    submit.className = "interactive-hit pointer-events-auto left-[50.77%] top-[38.74%] h-[0.995%] w-[15.14%]";
    submit.type = "submit";
    submit.setAttribute("aria-label", "Підготувати повідомлення");
    form.append(submit);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        const href = createMailto(data.get("name"), data.get("email"), data.get("message"));
        const content = document.createElement("div");
        content.className = "grid gap-4";
        const message = document.createElement("p");
        message.className = "text-sm text-coffee-ink/75";
        message.textContent = "Перевірте повідомлення в поштовій програмі й надішліть його звідти.";
        const link = document.createElement("a");
        link.className = "action-button";
        link.href = href;
        link.textContent = "Відкрити поштову програму";
        content.append(message, link);
        openDialog("Повідомлення підготовлено", content);
    });
    artwork.append(form);
}

function button(label, onClick, disabled = false) {
    const control = document.createElement("button");
    control.className = "action-button";
    control.type = "button";
    control.textContent = label;
    control.disabled = disabled;
    control.addEventListener("click", onClick);
    return control;
}

function addToCart(productId, customName) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
        showToast("Не вдалося знайти цей товар.");
        return;
    }
    const item = cart.find((entry) => entry.id === productId && entry.name === (customName || product.name));
    if (item) item.quantity += 1;
    else cart.push({ id: productId, name: customName || product.name, quantity: 1, price: product.price });
    saveCart();
    updateCartLabel();
    showToast(`${customName || product.name} додано до кошика.`);
}

function cartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartLabel() {
    const cartLink = artwork.querySelector(".header-cart-entry");
    if (cartLink) cartLink.setAttribute("aria-label", `Відкрити кошик, товарів: ${cartCount()}`);
}

function openCart() {
    const content = document.createElement("div");
    content.className = "grid gap-4";
    if (cart.length === 0) {
        const empty = document.createElement("p");
        empty.className = "text-coffee-ink/75";
        empty.textContent = "Кошик поки порожній. Перейдіть до каталогу, щоб обрати каву.";
        content.append(empty);
        content.append(button("Відкрити каталог", () => {
            window.location.href = "katalog.html";
        }));
    } else {
        const list = document.createElement("ul");
        list.className = "grid gap-3";
        cart.forEach((item, index) => {
            const row = document.createElement("li");
            row.className = "flex items-center justify-between gap-3 border-b border-coffee-tan/30 pb-3";
            const name = document.createElement("span");
            name.className = "text-sm";
            name.textContent = `${item.name} · ${item.quantity} × ${item.price} грн`;
            row.append(name, button("Вилучити", () => {
                cart.splice(index, 1);
                saveCart();
                updateCartLabel();
                openCart();
            }));
            list.append(row);
        });
        content.append(list);
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const summary = document.createElement("p");
        summary.className = "font-semibold";
        summary.textContent = `Разом: ${total} грн`;
        content.append(summary);
        const actions = document.createElement("div");
        actions.className = "flex flex-wrap gap-3";
        actions.append(
            button("Оформити замовлення", () => {
                closeDialog();
                openContactForm("Оформлення замовлення");
            }),
            button("Очистити кошик", () => {
                cart = [];
                saveCart();
                updateCartLabel();
                openCart();
            })
        );
        content.append(actions);
    }
    openDialog(`Кошик · ${cartCount()} товарів`, content);
}

function openContactForm(title = "Напишіть нам") {
    const content = document.createElement("form");
    content.className = "grid gap-4";
    content.innerHTML = `
        <label class="grid gap-1 text-sm font-medium">Ваше ім'я<input class="action-input" name="name" autocomplete="name" required maxlength="100" placeholder="Як до вас звертатися?"></label>
        <label class="grid gap-1 text-sm font-medium">Електронна пошта<input class="action-input" name="email" type="email" autocomplete="email" required maxlength="200" placeholder="name@example.com"></label>
        <label class="grid gap-1 text-sm font-medium">Повідомлення<textarea class="action-input min-h-32" name="message" required maxlength="2000" placeholder="Чим можемо допомогти?"></textarea></label>
        <p class="text-sm text-coffee-ink/70">Надсилання відкриє вашу поштову програму з готовим листом.</p>
        <button class="action-button" type="submit">Підготувати лист</button>`;
    content.querySelector("textarea").value = title === "Оформлення замовлення"
        ? cart.map((item) => `${item.name} — ${item.quantity} × ${item.price} грн`).join("\n")
        : "";
    content.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!content.reportValidity()) return;
        const data = new FormData(content);
        const link = document.createElement("a");
        link.className = "action-button";
        link.href = createMailto(data.get("name"), data.get("email"), data.get("message"), title);
        link.textContent = "Відкрити поштову програму";
        content.replaceChildren(link);
    });
    openDialog(title, content);
}

function createMailto(name, email, message, subject = `Повідомлення від ${name}`) {
    const body = `${message}\n\nВід: ${name}\nEmail: ${email}`;
    return `mailto:hello@smazhena.example?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function shareArticle() {
    const shareData = {
        title: document.title,
        text: "Рецепт V60 від «Смажена кава»",
        url: window.location.href
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareData.url);
            showToast("Посилання на статтю скопійовано.");
        } else {
            openContactForm("Поділіться статтею");
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Unable to share the article.", error);
            showToast("Не вдалося поділитися статтею.");
        }
    }
}

function showToast(message) {
    let toast = document.querySelector("[data-toast]");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-coffee-ink px-5 py-3 text-center text-sm text-white shadow-xl";
        toast.setAttribute("role", "status");
        toast.dataset.toast = "true";
        document.body.append(toast);
    }
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.hidden = true;
    }, 3200);
}
