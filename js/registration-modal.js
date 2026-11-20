document.addEventListener("DOMContentLoaded", () => {
    const dialog = document.querySelector("#registration-dialog");
    const form = document.querySelector("#registration-form");

    if (!(dialog instanceof HTMLDialogElement) || !(form instanceof HTMLFormElement)) return;

    const name = form.elements.namedItem("name");
    const email = form.elements.namedItem("email");
    const password = form.elements.namedItem("password");
    const confirmation = form.elements.namedItem("password-confirmation");
    const status = document.querySelector("#registration-status");
    let trigger = null;

    const syncPasswordConfirmation = () => {
        if (!(password instanceof HTMLInputElement) || !(confirmation instanceof HTMLInputElement)) return;

        confirmation.setCustomValidity(
            confirmation.value && password.value !== confirmation.value
                ? "Паролі не збігаються."
                : ""
        );
    };

    const closeDialog = () => {
        if (dialog.open) dialog.close();
    };

    document.querySelectorAll("[data-open-registration]").forEach((button) => {
        button.addEventListener("click", () => {
            trigger = button;
            const mobileMenu = document.querySelector("#mobile-menu");
            const menuTrigger = document.querySelector("#menu-trigger");

            if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
                mobileMenu.classList.add("hidden");
                mobileMenu.setAttribute("aria-hidden", "true");
                menuTrigger?.setAttribute("aria-expanded", "false");
                menuTrigger?.setAttribute("aria-label", "Відкрити меню");
            }

            if (!dialog.open) dialog.showModal();
            document.body.classList.add("overflow-hidden");
            window.requestAnimationFrame(() => name?.focus());
        });
    });

    dialog.querySelector("[data-close-registration]")?.addEventListener("click", closeDialog);

    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog();
    });

    dialog.addEventListener("close", () => {
        document.body.classList.remove("overflow-hidden");
        trigger?.focus();
        trigger = null;
    });

    dialog.addEventListener("cancel", () => {
        document.body.classList.remove("overflow-hidden");
    });

    password?.addEventListener("input", syncPasswordConfirmation);
    confirmation?.addEventListener("input", syncPasswordConfirmation);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        syncPasswordConfirmation();

        if (!form.checkValidity()) {
            if (status) {
                status.textContent = "Перевірте, будь ласка, виділені поля.";
                status.className = "min-h-5 text-sm font-medium text-red-700";
            }
            form.reportValidity();
            return;
        }

        if (!(name instanceof HTMLInputElement) || !(email instanceof HTMLInputElement)) return;

        try {
            localStorage.setItem("roasted-coffee-profile", JSON.stringify({
                name: name.value.trim(),
                email: email.value.trim(),
                createdAt: new Date().toISOString()
            }));

            form.reset();
            if (status) {
                status.textContent = "Профіль створено на цьому пристрої.";
                status.className = "min-h-5 text-sm font-medium text-coffee-green";
            }
        } catch (error) {
            if (status) {
                status.textContent = "Не вдалося зберегти профіль у цьому браузері.";
                status.className = "min-h-5 text-sm font-medium text-red-700";
            }
        }
    });
});
