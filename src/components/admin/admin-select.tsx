"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ParsedOption = {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
};

function parseOptions(children: ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const props = child.props as {
      value?: string | number;
      children?: ReactNode;
      label?: string;
      disabled?: boolean;
    };

    if (child.type === "optgroup") {
      Children.forEach(props.children, (groupChild) => {
        if (!isValidElement(groupChild) || groupChild.type !== "option") return;
        const optionProps = groupChild.props as {
          value?: string | number;
          children?: ReactNode;
          disabled?: boolean;
        };
        options.push({
          value: String(optionProps.value ?? ""),
          label: String(optionProps.children ?? ""),
          group: props.label,
          disabled: optionProps.disabled,
        });
      });
      return;
    }

    if (child.type === "option") {
      options.push({
        value: String(props.value ?? ""),
        label: String(props.children ?? ""),
        disabled: props.disabled,
      });
    }
  });

  return options;
}

type AdminSelectProps = {
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
  className?: string;
  wrapperClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  children: ReactNode;
};

export function AdminSelect({
  id,
  name,
  value,
  defaultValue,
  onValueChange,
  className,
  wrapperClassName,
  disabled = false,
  children,
  ...ariaProps
}: AdminSelectProps) {
  const options = useMemo(() => parseOptions(children), [children]);
  const initialValue =
    value !== undefined
      ? String(value)
      : defaultValue !== undefined
        ? String(defaultValue)
        : (options[0]?.value ?? "");
  const [internalValue, setInternalValue] = useState(initialValue);
  const currentValue = value !== undefined ? String(value) : internalValue;

  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const selectedOption =
    options.find((option) => option.value === currentValue) ?? options[0];

  const positionMenu = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, 220);
    const estimatedHeight = Math.min(320, options.length * 38 + 16);
    let left = rect.left;
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - width - 12);
    }
    let top = rect.bottom + 8;
    if (top + estimatedHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - estimatedHeight - 8);
    }

    setMenuStyle({
      position: "fixed",
      top,
      left,
      width,
      zIndex: 100,
    });
  }, [options.length]);

  const openMenu = () => {
    if (disabled) return;
    const selectedIndex = options.findIndex(
      (option) => option.value === currentValue,
    );
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    positionMenu();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    positionMenu();
    const reposition = () => positionMenu();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, positionMenu]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listboxRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${baseId}-option-${highlighted}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [baseId, highlighted, open]);

  function choose(option: ParsedOption) {
    if (option.disabled) return;
    if (value === undefined) setInternalValue(option.value);
    onValueChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) =>
        Math.min(options.length - 1, index + 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => Math.max(0, index - 1));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setHighlighted(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setHighlighted(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[highlighted];
      if (option) choose(option);
    }
  }

  return (
    <div className={cn("relative", wrapperClassName)}>
      {name ? (
        <input type="hidden" name={name} value={currentValue} />
      ) : null}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && options[highlighted]
            ? optionId(highlighted)
            : undefined
        }
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={cn(
          "field flex cursor-pointer items-center justify-between gap-3 pr-10 text-left disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...ariaProps}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? ""}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-navy-500 transition duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open
        ? createPortal(
            <div
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              style={menuStyle}
              className="max-h-80 overflow-y-auto overscroll-contain rounded-2xl border border-stone-200 bg-white p-1.5 shadow-[0_24px_64px_-24px_rgba(11,39,53,0.35)] ring-1 ring-black/5 [scrollbar-color:var(--color-sand-300)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sand-300 [&::-webkit-scrollbar-track]:bg-transparent"
            >
              {options.map((option, index) => {
                const previous = options[index - 1];
                const showGroup =
                  option.group && option.group !== previous?.group;
                const selected = option.value === currentValue;

                return (
                  <div key={`${option.group ?? ""}:${option.value}:${index}`}>
                    {showGroup ? (
                      <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-400">
                        {option.group}
                      </p>
                    ) : null}
                    <div
                      id={optionId(index)}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={option.disabled || undefined}
                      onMouseEnter={() => setHighlighted(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(option)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                        selected
                          ? "bg-navy-950 text-white"
                          : index === highlighted
                            ? "bg-sand-100 text-navy-950"
                            : "text-stone-700",
                        option.disabled &&
                          "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {selected ? (
                        <Check
                          className="h-4 w-4 shrink-0 text-gold-400"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
