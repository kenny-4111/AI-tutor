import Link from "next/link";

const features = [
  {
    title: "Hands-free lessons",
    description:
      "Speak naturally and let the AI tutor respond with lifelike video guidance.",
  },
  {
    title: "Curriculum aware",
    description:
      "Import lesson plans and keep every learner on track effortlessly.",
  },
  {
    title: "Progress insights",
    description:
      "Track engagement, completion, and knowledge gaps in real time.",
  },
];

const testimonials = [
  {
    quote:
      "My students stay engaged longer because the tutor feels personal and responsive.",
    name: "Ava Thompson",
    role: "Instructional Designer",
  },
  {
    quote:
      "Setup took minutes. The blended video + voice experience is a game changer.",
    name: "Jordan Lee",
    role: "Learning Experience Lead",
  },
];

export default function LandingPage() {
  return (
    <div className="isolate overflow-hidden">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 py-24 text-center">
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-blue-300">
          Next-generation AI tutoring platform
        </span>
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Deliver cinematic AI tutoring that adapts to every learner
          </h1>
          <p className="text-lg text-gray-300">
            Interactive lessons powered by lifelike AI instructors. Engage
            learners with hands-free conversations and real-time feedback.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="w-full rounded-full bg-accent px-6 py-3 text-center text-base font-medium text-blue-950 transition hover:opacity-95 sm:w-auto">
            Start for free
          </Link>
          <Link
            href="/pricing"
            className="w-full rounded-full border border-white/10 px-6 py-3 text-center text-base font-medium text-white transition hover:border-white/20 sm:w-auto">
            View pricing
          </Link>
        </div>
        <div className="mt-12 grid w-full grid-cols-1 gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="space-y-3 p-4 text-left">
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-linear-to-b from-white/5 to-transparent py-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
          <h2 className="text-center text-3xl font-semibold text-white">
            Loved by learning teams
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.name}
                className="rounded-2xl border border-white/10 bg-gray-900/60 p-6 text-left shadow-lg shadow-black/20">
                <p className="text-gray-200">“{testimonial.quote}”</p>
                <footer className="mt-4 text-sm text-gray-400">
                  {testimonial.name} · {testimonial.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 rounded-3xl card px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold text-white">
            Give your learners a tutor they’ll never outgrow
          </h2>
          <p className="max-w-2xl text-base text-blue-100">
            Launch in minutes with Google sign-in and scale to enterprise-ready
            deployments. Set the access level per package and tailor every
            session experience.
          </p>
          <Link
            href="/signup"
            className="rounded-full bg-white px-6 py-3 text-base font-semibold text-blue-600 transition hover:bg-blue-100">
            Create your account
          </Link>
        </div>
      </section>
    </div>
  );
}
