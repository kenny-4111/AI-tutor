"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface UsageData {
  used: number;
  total: number;
  resetDate: string;
}

export default function SubscriptionTracker() {
  const pathname = usePathname();
  const [subscriptionUsage, setSubscriptionUsage] = useState<UsageData>(() => {
    try {
      const saved =
        typeof window !== "undefined" ?
          localStorage.getItem("subscriptionUsage")
        : null;
      if (saved) return JSON.parse(saved) as UsageData;
    } catch {
      // ignore parse errors
    }

    return {
      used: 0,
      total: 10000,
      resetDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1,
      ).toLocaleDateString(),
    };
  });

  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Only show on dashboard
  const isOnDashboard = pathname === "/dashboard";

  // Session (we show a subtle inactive state for guests)
  const { data: session, status } = useSession();

  // Keep in sync if another tab updates the stored usage
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "subscriptionUsage" && e.newValue) {
        try {
          setSubscriptionUsage(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        setShowModal(false);
      }
    }

    if (showModal) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showModal]);

  if (!isOnDashboard) return null;

  return (
    <div ref={containerRef} className="relative">
      {/* Icon Button */}
      <button
        onClick={() => setShowModal((s) => !s)}
        className={`relative w-10 h-10 rounded-full bg-white/6 hover:bg-white/12 border border-white/10 flex items-center justify-center text-lg transition-all duration-150 focus:outline-none`}
        title={
          status !== "authenticated" ?
            "Sign in to view usage"
          : "View subscription usage"
        }
        aria-label="Open subscription usage">
        {/* Icon */}
        <span className="text-xl">📊</span>

        {/* Numeric percent badge */}
        <span
          className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center text-white ${
            subscriptionUsage.used >= subscriptionUsage.total ? "bg-red-500"
            : subscriptionUsage.used >= subscriptionUsage.total * 0.9 ?
              "bg-yellow-400"
            : "bg-emerald-400"
          } ring-2 ring-black/20 shadow-sm`}
          title={
            status !== "authenticated" ?
              "Sign in to view usage"
            : `${Math.round(
                (subscriptionUsage.used / subscriptionUsage.total) * 100,
              )}% used`
          }
          aria-hidden>
          {status === "authenticated" ?
            `${Math.round(
              (subscriptionUsage.used / subscriptionUsage.total) * 100,
            )}%`
          : "—"}
        </span>
      </button>

      {/* Anchored dropdown */}
      {showModal && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-xl border border-white/10 p-4 shadow-xl">
            {status !== "authenticated" ?
              <div className="text-sm text-gray-300">
                <p className="mb-3">
                  Sign in to view detailed subscription usage.
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1 rounded bg-accent text-black text-sm font-medium">
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1 rounded border border-white/10 text-sm">
                    Create account
                  </Link>
                </div>
              </div>
            : <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Monthly Usage</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  Resets: {subscriptionUsage.resetDate}
                </div>

                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-3">
                  <div
                    className="bg-linear-to-r from-accent to-cyan-400 h-full transition-all duration-300"
                    style={{
                      width: `${
                        (subscriptionUsage.used / subscriptionUsage.total) * 100
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 font-medium">
                    {subscriptionUsage.used.toLocaleString()} /{" "}
                    {subscriptionUsage.total.toLocaleString()} words
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      subscriptionUsage.used >= subscriptionUsage.total ?
                        "text-red-400"
                      : (
                        subscriptionUsage.used >= subscriptionUsage.total * 0.9
                      ) ?
                        "text-yellow-400"
                      : "text-emerald-400"
                    }`}>
                    {Math.round(
                      (subscriptionUsage.used / subscriptionUsage.total) * 100,
                    )}
                    % used
                  </span>
                </div>

                {subscriptionUsage.used >= subscriptionUsage.total && (
                  <div className="mt-3 p-3 rounded-md bg-red-900/20 border border-red-500/30">
                    <p className="text-sm text-red-300">
                      You&apos;ve reached your monthly limit. Upgrade your plan
                      for more words.
                    </p>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={async () => {
                      // Try to open billing portal if available, otherwise go to pricing
                      try {
                        const res = await fetch("/api/billing/portal", {
                          method: "POST",
                        });
                        if (res.ok) {
                          const { url } = await res.json();
                          if (url) {
                            window.location.href = url;
                            return;
                          }
                        }
                      } catch (e) {
                        // ignore and fallback
                      }
                      router.push("/pricing");
                    }}
                    className="px-3 py-1 rounded bg-accent text-black text-sm font-medium">
                    Manage subscription
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}
