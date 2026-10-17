"use client";

import { useCallback, useSyncExternalStore } from "react";
import { EDITOR_NAME_STORAGE_KEY, MAX_EDITOR_NAME_LENGTH } from "@/lib/orders/orderConstants";

const listeners = new Set<() => void>();
let currentName: string | null = null;

function readStoredName(): string {
  try {
    return window.localStorage.getItem(EDITOR_NAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): string {
  if (currentName === null) currentName = readStoredName();
  return currentName;
}

/** The team member's name, remembered in this browser. It labels edits and is not a login. */
export function useEditorName() {
  const editorName = useSyncExternalStore(subscribe, getSnapshot, () => "");

  const setEditorName = useCallback((name: string) => {
    currentName = name.slice(0, MAX_EDITOR_NAME_LENGTH);
    try {
      window.localStorage.setItem(EDITOR_NAME_STORAGE_KEY, currentName);
    } catch {
      // Storage can be blocked; the name still works for this visit.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { editorName, setEditorName };
}