"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function NavAuthButton() {
  const { data: session, status } = useSession();
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // click-outside to close dropdown
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showConfirm) return;
      if (!wrapperRef.current) return;
      const target = e.target as Node;
      if (!wrapperRef.current.contains(target)) {
        setShowConfirm(false);
      }
    }
    if (showConfirm) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showConfirm]);

  if (status !== "authenticated") {
    return (
      <Link
        href="/login"
        className="rounded-full bg-accent px-4 py-2 font-medium text-blue-950 hover:opacity-95">
        Sign In
      </Link>
    );
  }

  function handleSignOut() {
    // open dropdown-style confirmation
    setShowConfirm(true);
  }

  async function doSignOut() {
    if (busy) return;
    try {
      setBusy(true);
      await signOut({ callbackUrl: "/" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={handleSignOut}
        disabled={busy}
        className="rounded-full bg-transparent px-4 py-2 font-medium border border-white/10 hover:bg-white/3 disabled:opacity-60">
        {busy ? "Signing out…" : "Log out"}
      </button>

      <ConfirmModal open={showConfirm} onCancel={() => setShowConfirm(false)} onConfirm={doSignOut} busy={busy} />
    </div>
  );
}

// Render confirmation modal at the end so it's part of the same component
// (keeps hooks order stable). We render modal markup outside the return above
// by attaching it to document body via a portal would be ideal, but to keep
// things simple we conditionally render it here.

function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  if (!open) return null;
  return (
    // Dropdown-style panel anchored to the button (rendered inside a relative wrapper)
    <div className="absolute right-0 top-full mt-2 z-50">
      <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-lg border border-white/10 p-4 w-56 shadow-lg">
        <h3 className="text-sm font-semibold mb-1">Sign out</h3>
        <p className="text-xs text-gray-300 mb-3">Are you sure you want to sign out?</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-2 py-1 rounded border border-white/10 text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-2 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-60">
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal component is rendered inside this client component when `showConfirm` is true.
