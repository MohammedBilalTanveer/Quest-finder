import { useEffect, useRef, useState } from "react";

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyButton({ latitude, longitude, className = "btn small" }) {
  const [state, setState] = useState("idle"); // idle | copied | failed
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function onClick(e) {
    e.stopPropagation();
    const ok = await copyText(`${latitude}, ${longitude}`);
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }

  return (
    <button type="button" className={className} onClick={onClick} aria-live="polite">
      {state === "copied" ? "Copied!" : state === "failed" ? "Copy failed" : "Copy coordinates"}
    </button>
  );
}
