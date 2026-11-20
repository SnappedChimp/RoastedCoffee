document.addEventListener("DOMContentLoaded", () => {
    const dialog = document.querySelector("#feedback-dialog");
    const form = document.querySelector("#feedback-dialog-form");
    const validation = globalThis.FeedbackValidation;

    if (!(dialog instanceof HTMLDialogElement) || !(form instanceof HTMLFormElement) || !validation) return;

    const status = dialog.querySelector("#feedback-dialog-status");
    const formState = dialog.querySelector("#feedback-form-state");
    const successState = dialog.querySelector("#feedback-success-state");
    const formHeading = dialog.querySelector("#feedback-form-heading");
    const formTitle = dialog.querySelector("#feedback-dialog-title");
    const successTitle = dialog.querySelector("#feedback-success-title");
    const formDescription = dialog.querySelector("#feedback-dialog-description");
    const successDescription = dialog.querySelector("#feedback-success-description");
    const submitButton = dialog.querySelector("#feedback-submit");
    const nameField = dialog.querySelector("#feedback-name");
    const emailField = dialog.querySelector("#feedback-email");
    const phoneDigitsField = dialog.querySelector("#feedback-phone-digits");
    const fullPhoneField = dialog.querySelector("#feedback-phone");
    const messageField = dialog.querySelector("#feedback-message");
    const messageCount = dialog.querySelector("#feedback-message-count");
    const agreementField = dialog.querySelector("#feedback-agreement");
    const fields = [nameField, emailField, phoneDigitsField, messageField, agreementField]
        .filter((field) => field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement);

    let opener = null;
    let scrollPosition = 0;
    let bodyStyle = null;
    let submitWasEnabled = false;

    const focusableElements = () => [...dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.closest("[hidden]"));

    const setStatus = (message = "", tone = "default") => {
        if (!status) return;
        status.textContent = message;
        status.className = tone === "error"
            ? "min-h-5 text-sm font-medium text-red-700"
            : tone === "success"
                ? "min-h-5 text-sm font-medium text-coffee-green"
                : "min-h-5 text-sm font-medium";
    };

    const getFieldResult = (field) => {
        switch (field.id) {
            case "feedback-name": return validation.validateName(field.value);
            case "feedback-email": return validation.validateEmail(field.value);
            case "feedback-phone-digits": return validation.validatePhoneDigits(field.value);
            case "feedback-message": return validation.validateMessage(field.value);
            case "feedback-agreement": return validation.validateAgreement(field.checked);
            default: return { valid: true, message: "" };
        }
    };

    const getVisualTarget = (field) => {
        const targetId = field.dataset.visualTarget;
        return targetId ? dialog.querySelector(`#${targetId}`) || field : field;
    };

    const setFieldState = (field, result, reveal = false) => {
        const touched = reveal || field.dataset.touched === "true";
        const error = dialog.querySelector(`#${field.id}-error`);
        const visualTarget = getVisualTarget(field);
        const optionalEmptyMessage = field.id === "feedback-message" && !field.value.trim();
        const state = !touched || optionalEmptyMessage ? "idle" : result.valid ? "success" : "error";

        field.dataset.state = state;
        visualTarget.dataset.state = state;
        field.setAttribute("aria-invalid", touched ? String(!result.valid) : "false");
        if (error) {
            error.textContent = result.message;
            error.hidden = !touched || result.valid;
        }
    };

    const syncFullPhoneValue = () => {
        if (phoneDigitsField instanceof HTMLInputElement && fullPhoneField instanceof HTMLInputElement) {
            fullPhoneField.value = `+380${phoneDigitsField.value}`;
        }
    };

    const updateMessageCount = () => {
        if (messageField instanceof HTMLTextAreaElement && messageCount) {
            messageCount.textContent = `${messageField.value.length} / 500`;
        }
    };

    const updateSubmitButtonState = ({ announce = true } = {}) => {
        if (!(submitButton instanceof HTMLButtonElement)) return false;
        const formIsValid = fields.every((field) => getFieldResult(field).valid);
        submitButton.disabled = !formIsValid;

        if (announce && formIsValid !== submitWasEnabled) {
            setStatus(
                formIsValid
                    ? "Усі обов’язкові поля заповнені коректно. Кнопка «Надіслати» активна."
                    : "Кнопка «Надіслати» знову недоступна, доки обов’язкові поля не заповнені коректно.",
                formIsValid ? "success" : "default"
            );
        }
        submitWasEnabled = formIsValid;
        return formIsValid;
    };

    const validateField = (field, reveal = false) => {
        const result = getFieldResult(field);
        setFieldState(field, result, reveal);
        return result;
    };

    const resetFormState = () => {
        form.reset();
        fields.forEach((field) => {
            field.dataset.touched = "false";
            setFieldState(field, getFieldResult(field));
        });
        syncFullPhoneValue();
        updateMessageCount();
        submitWasEnabled = false;
        setStatus();
        updateSubmitButtonState({ announce: false });
    };

    const showFormState = ({ reset = false, focus = false } = {}) => {
        if (reset) resetFormState();
        if (formHeading) formHeading.hidden = false;
        if (formState) formState.hidden = false;
        if (successState) successState.hidden = true;
        if (formTitle) dialog.setAttribute("aria-labelledby", formTitle.id);
        if (formDescription) dialog.setAttribute("aria-describedby", formDescription.id);
        if (focus) window.requestAnimationFrame(() => nameField?.focus());
    };

    const showSuccessState = () => {
        if (formHeading) formHeading.hidden = true;
        if (formState) formState.hidden = true;
        if (successState) successState.hidden = false;
        if (successTitle) {
            dialog.setAttribute("aria-labelledby", successTitle.id);
            window.requestAnimationFrame(() => successTitle.focus());
        }
        if (successDescription) dialog.setAttribute("aria-describedby", successDescription.id);
    };

    const lockPageScroll = () => {
        scrollPosition = window.scrollY;
        bodyStyle = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width
        };
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.width = "100%";
    };

    const restorePageScroll = () => {
        if (!bodyStyle) return;
        document.body.style.overflow = bodyStyle.overflow;
        document.body.style.position = bodyStyle.position;
        document.body.style.top = bodyStyle.top;
        document.body.style.width = bodyStyle.width;
        window.scrollTo(0, scrollPosition);
        bodyStyle = null;
    };

    const closeFeedbackDialog = () => {
        if (dialog.open) dialog.close();
    };

    const openFeedbackDialog = (button) => {
        opener = button;
        showFormState({ reset: true });
        lockPageScroll();
        dialog.showModal();
        window.requestAnimationFrame(() => nameField?.focus());
    };

    const updateTextInput = (field, normalizer) => {
        const caret = field.selectionStart ?? field.value.length;
        const normalized = normalizer(field.value);

        if (field.value !== normalized) {
            const normalizedBeforeCaret = normalizer(field.value.slice(0, caret));
            field.value = normalized;
            field.setSelectionRange(normalizedBeforeCaret.length, normalizedBeforeCaret.length);
        }
    };

    const applyPhoneDigits = (digits, caret = digits.length) => {
        if (!(phoneDigitsField instanceof HTMLInputElement)) return;
        const nextDigits = digits.replace(/\D/g, "").slice(0, 9);
        phoneDigitsField.value = nextDigits;
        phoneDigitsField.setSelectionRange(Math.min(caret, nextDigits.length), Math.min(caret, nextDigits.length));
        syncFullPhoneValue();
    };

    document.querySelectorAll("[data-open-feedback]").forEach((button) => {
        button.addEventListener("click", () => openFeedbackDialog(button));
    });

    dialog.querySelector("[data-close-feedback]")?.addEventListener("click", closeFeedbackDialog);
    dialog.querySelector("[data-feedback-return-home]")?.addEventListener("click", closeFeedbackDialog);
    dialog.querySelector("[data-feedback-fill-again]")?.addEventListener("click", () => {
        showFormState({ reset: true, focus: true });
    });

    dialog.addEventListener("click", (event) => {
        if (event.target !== event.currentTarget) return;

        const bounds = dialog.getBoundingClientRect();
        const clickedOutsideDialog = event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom;

        if (clickedOutsideDialog) closeFeedbackDialog();
    });

    dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeFeedbackDialog();
    });

    dialog.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;

        const focusable = focusableElements();
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!first || !last) return;
        if (event.shiftKey && (document.activeElement === first || document.activeElement === successTitle)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    dialog.addEventListener("close", () => {
        showFormState({ reset: true });
        restorePageScroll();
        opener?.focus();
        opener = null;
    });

    if (nameField instanceof HTMLInputElement) {
        nameField.addEventListener("input", () => {
            updateTextInput(nameField, validation.normalizeNameInput);
            nameField.dataset.touched = "true";
            validateField(nameField);
            updateSubmitButtonState();
        });
    }

    if (emailField instanceof HTMLInputElement) {
        emailField.addEventListener("input", () => {
            updateTextInput(emailField, (value) => value.replace(/\s/gu, "").slice(0, 254));
            emailField.dataset.touched = "true";
            validateField(emailField);
            updateSubmitButtonState();
        });
    }

    if (phoneDigitsField instanceof HTMLInputElement) {
        phoneDigitsField.addEventListener("input", () => {
            const rawValue = phoneDigitsField.value;
            const caret = phoneDigitsField.selectionStart ?? rawValue.length;
            const fullPhone = rawValue.match(/^\+380(\d{0,9})$/);
            const digitsBeforeCaret = fullPhone
                ? Math.max(0, caret - 4)
                : rawValue.slice(0, caret).replace(/\D/g, "").slice(0, 9).length;

            applyPhoneDigits(fullPhone ? fullPhone[1] : rawValue, digitsBeforeCaret);
            phoneDigitsField.dataset.touched = "true";
            validateField(phoneDigitsField);
            updateSubmitButtonState();
        });

        phoneDigitsField.addEventListener("paste", (event) => {
            const pasted = event.clipboardData?.getData("text") || "";
            const normalized = validation.normalizePhonePaste(pasted);

            event.preventDefault();
            if (!normalized) {
                phoneDigitsField.dataset.touched = "true";
                validateField(phoneDigitsField);
                updateSubmitButtonState();
                return;
            }

            const isFullPhone = /^\+380\d{9}$/.test(pasted.trim()) || /^0\d{9}$/.test(pasted.trim());
            if (isFullPhone) {
                applyPhoneDigits(normalized);
            } else {
                const start = phoneDigitsField.selectionStart ?? phoneDigitsField.value.length;
                const end = phoneDigitsField.selectionEnd ?? start;
                const next = `${phoneDigitsField.value.slice(0, start)}${normalized}${phoneDigitsField.value.slice(end)}`;
                applyPhoneDigits(next, start + normalized.length);
            }

            phoneDigitsField.dataset.touched = "true";
            validateField(phoneDigitsField);
            updateSubmitButtonState();
        });
    }

    if (messageField instanceof HTMLTextAreaElement) {
        messageField.addEventListener("input", () => {
            if (messageField.value.length > 500) messageField.value = messageField.value.slice(0, 500);
            messageField.dataset.touched = "true";
            updateMessageCount();
            validateField(messageField);
            updateSubmitButtonState();
        });
    }

    fields.forEach((field) => {
        field.addEventListener("blur", () => {
            field.dataset.touched = "true";
            const result = validateField(field);
            if (!result.valid) setStatus(result.message, "error");
            updateSubmitButtonState({ announce: result.valid });
        });
        field.addEventListener("change", () => {
            field.dataset.touched = "true";
            if (field === phoneDigitsField) syncFullPhoneValue();
            const result = validateField(field);
            if (!result.valid) setStatus(result.message, "error");
            updateSubmitButtonState({ announce: result.valid });
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const isValid = fields.every((field) => {
            field.dataset.touched = "true";
            return validateField(field, true).valid;
        });

        updateSubmitButtonState();
        if (!isValid) {
            const firstInvalid = fields.find((field) => !getFieldResult(field).valid);
            setStatus("Перевірте, будь ласка, виділені поля.", "error");
            firstInvalid?.focus();
            return;
        }

        form.dispatchEvent(new CustomEvent("feedback:valid-submit", {
            bubbles: true,
            detail: Object.fromEntries(new FormData(form))
        }));
        showSuccessState();
    });
});
