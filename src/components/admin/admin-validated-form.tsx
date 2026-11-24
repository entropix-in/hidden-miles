"use client";

import type { ComponentProps } from "react";
import { validateFields } from "./admin-field-errors";

/** A plain `<form>` that shows browser validation errors inline under each field. */
export function AdminValidatedForm({ onSubmit, ...props }: ComponentProps<"form">) {
  return (
    <form {...props} noValidate onSubmit={(event) => {
      if (!validateFields(event.currentTarget)) {
        event.preventDefault();
        return;
      }
      onSubmit?.(event);
    }} />
  );
}
