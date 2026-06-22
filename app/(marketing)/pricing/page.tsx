import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    description: "Perfect for exploring AI Tutor with limited sessions.",
    features: [
      "Up to 3 active learner profiles",
      "Access to 5 AI tutor sessions per month",
      "Baseline analytics dashboard",
    ],
    cta: "Get started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$49",
    cadence: "per month",
    description: "Scale tutoring experiences across a growing cohort.",
    features: [
      "Unlimited learner profiles",
      "Priority avatar rendering speeds",
      "Curriculum uploads up to 500MB",
      "Progress and engagement analytics",
    ],
    cta: "Upgrade",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Let’s talk",
    cadence: "",
    description: "Tailored deployments for districts and learning platforms.",
    features: [
      "Dedicated success engineer",
      "Custom branding and SSO",
      "Unlimited curriculum libraries",
      "SLA-backed performance",
    ],
    cta: "Contact sales",
    href: "mailto:sales@aitutor.io",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-white">
          Flexible plans for every team
        </h1>
        <p className="mt-3 text-base text-gray-300">
          Start free, then unlock advanced access as your tutoring program
          grows.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="rounded-3xl border p-8 shadow-xl transition card">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">{tier.name}</h2>
              <p className="text-sm text-gray-300">{tier.description}</p>
            </div>
            <div className="mt-8">
              <span className="text-4xl font-bold text-white">
                {tier.price}
              </span>
              {tier.cadence && (
                <span className="ml-2 text-sm text-gray-400">
                  {tier.cadence}
                </span>
              )}
            </div>
            <ul className="mt-8 space-y-3 text-sm text-gray-200">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2 w-2 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {tier.href.startsWith("mailto:") ? (
              <a
                href={tier.href}
                className={`mt-10 block rounded-full px-4 py-3 text-center text-sm font-medium transition ${
                  tier.highlighted
                    ? "bg-accent text-blue-950"
                    : "bg-white/10 text-white"
                }`}>
                {tier.cta}
              </a>
            ) : (
              <Link
                href={tier.href}
                className={`mt-10 block rounded-full px-4 py-3 text-center text-sm font-medium transition ${
                  tier.highlighted
                    ? "bg-accent text-blue-950"
                    : "bg-white/10 text-white"
                }`}>
                {tier.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
