const siteNavigation = [
    ["Головна", "index.html"],
    ["Каталог", "katalog.html"],
    ["Про нас", "about-us.html"],
    ["Контакти", "contacts.html"],
    ["Блог", "blog.html"],
    ["Послуги", "services.html"],
    ["Конструктор", "constructor.html"]
];

class SiteHeader extends HTMLElement {
    connectedCallback() {
        if (this.hasAttribute("data-rendered")) return;
        this.setAttribute("data-rendered", "");

        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const links = siteNavigation.map(([label, href]) => {
            const current = href === currentPage ? ' aria-current="page"' : "";
            const menuLink = `<a class="rounded-xl px-4 py-3 text-coffee-muted transition-colors duration-200 hover:bg-coffee-paper hover:text-coffee-green-pressed focus-visible:outline-2 focus-visible:outline-coffee-tan focus-visible:outline-offset-[-2px] active:text-coffee-green-pressed" href="${href}"${current}>${label}</a>`;
            const navLink = `<a class="transition-colors hover:text-coffee-green-pressed focus-visible:outline-2 focus-visible:outline-coffee-tan" href="${href}"${current}>${label}</a>`;
            return { menuLink, navLink };
        });
        const mobileOnly = this.hasAttribute("mobile-only");
        const excludedMobilePage = currentPage === "article.html" ? "about-us.html" : currentPage;
        const mobileLinks = mobileOnly
            ? links.filter((_, index) => siteNavigation[index][1] !== excludedMobilePage)
            : links;
        const mobileMenu = `<details class="group relative z-40 lg:hidden">
            <summary class="grid h-12 w-12 cursor-pointer list-none place-content-center gap-[5px] rounded-full bg-coffee-green transition-colors duration-200 hover:bg-coffee-green-hover focus-visible:outline-2 focus-visible:outline-coffee-tan focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden" aria-label="Відкрити меню">
                <span class="block h-[3px] w-5 rounded-full bg-white transition-transform duration-200 group-open:translate-y-2 group-open:rotate-45"></span>
                <span class="block h-[3px] w-5 rounded-full bg-white transition-opacity duration-200 group-open:opacity-0"></span>
                <span class="block h-[3px] w-5 rounded-full bg-white transition-transform duration-200 group-open:-translate-y-2 group-open:-rotate-45"></span>
            </summary>
            <nav class="absolute right-0 top-[calc(100%+0.75rem)] grid min-w-52 gap-1 rounded-2xl border border-coffee-border bg-coffee-surface p-3 shadow-xl" aria-label="Мобільна навігація">
                ${mobileLinks.map(({ menuLink }) => menuLink).join("")}
            </nav>
        </details>`;

        if (this.hasAttribute("mobile-only")) {
            this.innerHTML = `<header class="mobile-header">
                <a class="mobile-brand text-coffee-ink transition-colors hover:text-coffee-green-hover" href="index.html" aria-label="Смажена кава — головна">
                    <svg class="mobile-brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                        <path d="M8 20h26v12a10 10 0 0 1-10 10h-6A10 10 0 0 1 8 32V20Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M34 23h3a5 5 0 0 1 0 10h-4M19 15c-3-3 4-4 1-8m8 8c-3-3 4-4 1-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>Смажена кава</span>
                </a>
                ${mobileMenu}
            </header>`;
            return;
        }

        this.innerHTML = `<header class="mx-auto w-full max-w-[1440px] px-0 pt-0 sm:px-4 sm:pt-4">
            <div class="flex min-h-20 items-center justify-between gap-4 rounded-b-[30px] bg-white px-5 py-3 sm:min-h-[6.5rem] sm:rounded-[40px] sm:px-8 lg:px-12">
                <a class="flex shrink-0 items-center gap-3 rounded-lg text-coffee-ink transition-colors hover:text-coffee-green-hover focus-visible:outline-2 focus-visible:outline-coffee-tan focus-visible:outline-offset-4 sm:gap-4" href="index.html" aria-label="Смажена кава — головна">
                    <img class="h-10 w-10 object-contain sm:h-12 sm:w-12" src="assets/images/roasted_coffee_vector_logo.svg" alt="">
                    <span class="text-base font-bold sm:text-xl lg:text-2xl">Смажена кава</span>
                </a>
                <nav class="hidden items-center gap-5 text-sm font-medium text-coffee-ink lg:flex xl:gap-8" aria-label="Головна навігація">
                    ${links.filter((_, index) => siteNavigation[index][1] !== "constructor.html").map(({ navLink }) => navLink).join("")}
                </nav>
                <a class="hidden min-h-12 shrink-0 items-center justify-center rounded-full bg-coffee-green px-6 text-sm font-semibold text-white transition-colors hover:bg-coffee-green-hover focus-visible:outline-2 focus-visible:outline-coffee-tan focus-visible:outline-offset-2 lg:inline-flex" href="katalog.html">Обрати каву</a>
                ${mobileMenu}
            </div>
        </header>`;
    }
}

if (!customElements.get("site-header")) {
    customElements.define("site-header", SiteHeader);
}
