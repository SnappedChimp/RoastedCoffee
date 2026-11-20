document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".feedback-form");

    if (!form) return;

    const fields = [...form.querySelectorAll("input, textarea")];
    const status = form.querySelector("#form-status");

    const updateFieldState = (field, showError = false) => {
        const error = form.querySelector(`#${field.id}-error`);
        const invalid = !field.validity.valid;

        field.setAttribute("aria-invalid", String(invalid));

        if (error) {
            error.hidden = !invalid || !showError;
        }
    };

    form.addEventListener("invalid", (event) => {
        updateFieldState(event.target, true);
    }, true);

    fields.forEach((field) => {
        field.addEventListener("blur", () => updateFieldState(field, true));

        field.addEventListener("input", () => {
            const error = form.querySelector(`#${field.id}-error`);

            if (error && !error.hidden) {
                updateFieldState(field, true);
            } else if (field.validity.valid) {
                updateFieldState(field);
            }
        });

        field.addEventListener("change", () => updateFieldState(field, true));
    });

    form.addEventListener("submit", () => {
        if (status) status.textContent = "";
    });
});
