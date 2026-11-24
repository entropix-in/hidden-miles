/** An error tied to one form field, so the admin form can show it under that field. */
export class FieldError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}

export function fieldOf(error: unknown) {
  return error instanceof FieldError ? error.field : undefined;
}

export type ActionResult = { error: string; field?: string };
