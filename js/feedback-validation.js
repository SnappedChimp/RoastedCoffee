(() => {
    const NAME_REGEX = /^\p{L}+(?:['’\-]\p{L}+)*(?: \p{L}+(?:['’\-]\p{L}+)*)*$/u;
    const EMAIL_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,63}$/;
    const PHONE_FULL_REGEX = /^\+380\d{9}$/;
    const PHONE_DIGITS_REGEX = /^\d{9}$/;

    const valid = () => ({ valid: true, message: "" });
    const invalid = (message) => ({ valid: false, message });

    const normalizeNameInput = (value) => String(value)
        .replace(/[^\p{L}\s'’\-]/gu, "")
        .replace(/\s+/gu, " ")
        .replace(/^\s+/u, "")
        .slice(0, 80);

    const validateName = (value) => {
        const name = String(value);

        if (!name.trim()) return invalid("Введіть ПІБ.");
        if (name !== name.trim()) return invalid("Приберіть пробіл наприкінці імені.");
        if (name.length < 3) return invalid("ПІБ має містити щонайменше 3 символи.");
        if (name.length > 80) return invalid("ПІБ не може містити більше 80 символів.");
        if (/ {2,}/u.test(name)) return invalid("Використовуйте лише один пробіл між словами.");
        if (!NAME_REGEX.test(name)) {
            return invalid("Використовуйте лише літери, одинарні пробіли, апострофи та дефіси між літерами.");
        }

        return valid();
    };

    const validateEmail = (value) => {
        const email = String(value);

        if (!email) return invalid("Введіть email-адресу.");
        if (email.length < 5) return invalid("Email має містити щонайменше 5 символів.");
        if (email.length > 254) return invalid("Email не може містити більше 254 символів.");
        if (/\s/u.test(email)) return invalid("Email не повинен містити пробілів.");
        if (email.includes("..")) return invalid("Email не повинен містити дві крапки поспіль.");
        if (!EMAIL_REGEX.test(email)) return invalid("Введіть коректну email-адресу.");

        return valid();
    };

    const validatePhoneDigits = (value) => {
        const digits = String(value);

        if (!digits) return invalid("Введіть 9 цифр після +380.");
        if (!PHONE_DIGITS_REGEX.test(digits)) return invalid("Після +380 дозволені лише 9 цифр.");

        return PHONE_FULL_REGEX.test(`+380${digits}`)
            ? valid()
            : invalid("Введіть номер у форматі +380XXXXXXXXX.");
    };

    const validateMessage = (value) => {
        const message = String(value);
        const lengthAfterTrim = message.trim().length;

        if (!lengthAfterTrim) return valid();
        if (lengthAfterTrim < 10) return invalid("Повідомлення має містити щонайменше 10 символів.");
        if (message.length > 500) return invalid("Повідомлення не може містити більше 500 символів.");

        return valid();
    };

    const validateAgreement = (checked) => checked
        ? valid()
        : invalid("Потрібно погодитися з політикою конфіденційності.");

    const normalizePhonePaste = (value) => {
        const pasted = String(value).trim();

        if (/^\+380\d{9}$/.test(pasted)) return pasted.slice(4);
        if (/^0\d{9}$/.test(pasted)) return pasted.slice(1);
        if (/^\d{1,9}$/.test(pasted)) return pasted;

        return "";
    };

    const api = {
        NAME_REGEX,
        EMAIL_REGEX,
        PHONE_FULL_REGEX,
        normalizeNameInput,
        normalizePhonePaste,
        validateName,
        validateEmail,
        validatePhoneDigits,
        validateMessage,
        validateAgreement
    };

    globalThis.FeedbackValidation = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
