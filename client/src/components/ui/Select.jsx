import React, { useEffect, useId, useRef, useState } from "react";

import { useClickOutside } from "../hooks/useClickOutside";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Sélectionner…",
  getKey = (o) => o,
  getLabel = (o) => o,
  classNames = {}, // { wrapper, trigger, menu, menuItem, active }
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);
  const inputId = useId();
  const listboxId = useId();

  useClickOutside(wrapperRef, () => setOpen(false));
  useEffect(() => {
    if (!open) setActiveIndex(-1);
  }, [open]);

  const commit = (opt) => {
    onChange?.(opt);
    setOpen(false);
    // garder le focus sur le trigger après sélection
    triggerRef.current?.focus();
  };

  const currentLabel = value ? getLabel(value) : "";

  const openMenu = () => {
    setOpen(true);
    setActiveIndex((i) => (i >= 0 ? i : 0));
  };

  const onKeyDown = (e) => {
    // ouverture avec espace/entrée/flèche bas
    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min((i < 0 ? -1 : i) + 1, options.length - 1));
      scrollIntoView(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
      scrollIntoView(Math.max(activeIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) commit(options[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const scrollIntoView = (idx) => {
    const listEl = listRef.current;
    const itemEl = listEl?.children?.[idx];
    if (!itemEl || !listEl) return;
    const top = itemEl.offsetTop,
      bottom = top + itemEl.offsetHeight;
    const vTop = listEl.scrollTop,
      vBottom = vTop + listEl.clientHeight;
    if (top < vTop) listEl.scrollTop = top;
    else if (bottom > vBottom) listEl.scrollTop = bottom - listEl.clientHeight;
  };

  return (
    <div className={classNames.wrapper} ref={wrapperRef}>
      {/* Trigger en DIV, focusable */}
      <div
        id={inputId}
        ref={triggerRef}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-autocomplete="none"
        tabIndex={0}
        className={classNames.trigger}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        // Empêche la sélection de texte parasite lors du click
        onMouseDown={(e) => e.preventDefault()}
      >
        {currentLabel || (
          <span className={classNames.placeholder}>{placeholder}</span>
        )}
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={inputId}
          className={classNames.menu}
          ref={listRef}
        >
          {options.map((opt, idx) => {
            const key = getKey(opt);
            const label = getLabel(opt);
            const isActive = idx === activeIndex;
            const isSelected = value && getKey(value) === key;
            return (
              <li
                key={key}
                role="option"
                aria-selected={isSelected}
                className={cx(
                  classNames.menuItem,
                  isActive && classNames.active
                )}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => e.preventDefault()} // garde le focus
                onClick={() => commit(opt)}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
