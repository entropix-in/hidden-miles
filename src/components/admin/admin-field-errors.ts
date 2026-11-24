"use client";

/*
 * Inline field errors for every admin form. Errors are placed under the field
 * they belong to, the field is marked invalid, scrolled into view and focused.
 * A field is found by `[data-field="name"]` (custom widgets) or by `[name="name"]`.
 */

const ERROR_CLASS = "field-error";
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function containerFor(form: HTMLFormElement, field: string) {
  const marked = form.querySelector<HTMLElement>(`[data-field="${CSS.escape(field)}"]`);
  if (marked) return marked;
  const control = form.querySelector<HTMLElement>(`[name="${CSS.escape(field)}"]`);
  return control ? containerOf(control) : null;
}

function containerOf(control: Element) {
  return control.closest<HTMLElement>("[data-field]") ?? control.closest<HTMLElement>("label") ?? control.parentElement;
}

function focusTarget(container: HTMLElement) {
  return container.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not([aria-hidden="true"]), select, textarea, button, [tabindex]:not([tabindex="-1"])',
  );
}

export function clearFieldErrors(form: HTMLFormElement) {
  form.querySelectorAll(`.${ERROR_CLASS}`).forEach((node) => node.remove());
  form.querySelectorAll("[data-invalid-field]").forEach((node) => {
    node.removeAttribute("data-invalid-field");
    node.querySelectorAll("[aria-invalid]").forEach((control) => control.removeAttribute("aria-invalid"));
  });
}

/** Shows `message` under `field`. Returns false when the field is not in the form. */
export function showFieldError(form: HTMLFormElement, field: string, message: string) {
  const container = containerFor(form, field);
  if (!container) return false;
  clearFieldErrors(form);

  const id = `${field}-error-${Math.random().toString(36).slice(2, 8)}`;
  const note = document.createElement("p");
  note.className = ERROR_CLASS;
  note.id = id;
  note.setAttribute("role", "alert");
  note.textContent = message;
  container.append(note);
  container.setAttribute("data-invalid-field", "");

  const target = focusTarget(container);
  if (target) {
    target.setAttribute("aria-invalid", "true");
    target.setAttribute("aria-describedby", [target.getAttribute("aria-describedby"), id].filter(Boolean).join(" "));
  }

  const clear = () => {
    note.remove();
    container.removeAttribute("data-invalid-field");
    target?.removeAttribute("aria-invalid");
    if (target) {
      const rest = (target.getAttribute("aria-describedby") ?? "").split(" ").filter((part) => part && part !== id);
      if (rest.length) target.setAttribute("aria-describedby", rest.join(" "));
      else target.removeAttribute("aria-describedby");
    }
    container.removeEventListener("input", clear);
    container.removeEventListener("change", clear);
    container.removeEventListener("click", clear);
  };
  container.addEventListener("input", clear);
  container.addEventListener("change", clear);
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    container.addEventListener("click", clear);
  }

  container.scrollIntoView({ behavior: "smooth", block: "center" });
  target?.focus({ preventScroll: true });
  return true;
}

function labelFor(control: Control) {
  const container = containerOf(control);
  const text = control.labels?.[0]?.textContent
    ?? container?.querySelector(".field-label")?.textContent
    ?? control.getAttribute("aria-label")
    ?? "";
  return text.replace(/\(optional\)/i, "").replace(/\*/g, "").trim();
}

function messageFor(control: Control) {
  const label = labelFor(control);
  const { validity } = control;
  if (validity.valueMissing) return label ? `${label} is required.` : "This field is required.";
  if (validity.rangeUnderflow && "min" in control) return `${label || "Value"} must be at least ${control.min}.`;
  if (validity.rangeOverflow && "max" in control) return `${label || "Value"} must be at most ${control.max}.`;
  return control.validationMessage;
}

/** Runs the browser's constraint checks and shows the first failure inline. */
export function validateFields(form: HTMLFormElement) {
  clearFieldErrors(form);
  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) continue;
    if (element.disabled || element.checkValidity()) continue;
    const container = element.closest<HTMLElement>("[data-field]");
    const field = container?.dataset.field ?? element.name;
    if (field && showFieldError(form, field, messageFor(element))) return false;
    const owner = containerOf(element);
    if (owner) {
      owner.setAttribute("data-field", element.name || element.id);
      showFieldError(form, owner.dataset.field!, messageFor(element));
      return false;
    }
  }
  return true;
}
