import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  FOCUS_OPTIONS,
  MARKET_OPTIONS,
  WEARABLE_OPTIONS,
} from "../funnel";

const STEP_COPY = [
  {
    eyebrow: "YOUR TECH",
    title: "What are you wearing?",
    description: "Pick the signal source you use most.",
  },
  {
    eyebrow: "YOUR FOCUS",
    title: "What do you want to stop guessing about?",
    description: "Choose up to two. There is no wrong answer here.",
  },
  {
    eyebrow: "YOUR INVITE",
    title: "Where should we send the good stuff?",
    description: "Just enough detail to make early access useful.",
  },
];

function ProgressDots({ step }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Question ${step + 1} of 3`}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`h-1.5 rounded-full transition-all ${
            index <= step ? "w-10 bg-[#0b2a55]" : "w-6 bg-[#0b2a55]/12"
          }`}
        />
      ))}
    </div>
  );
}

function RadioChoices({ name, value, onChange, options }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="radiogroup"
      aria-label={name === "wearable" ? "Primary wearable" : "Launch market"}
    >
      {options.map((option) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0b2a55] sm:text-base ${
              selected
                ? "border-[#0b2a55] bg-[#0b2a55] text-white shadow-[0_12px_28px_rgba(11,42,85,0.12)]"
                : "border-[#0b2a55]/12 bg-white/72 text-[#173757] hover:border-[#0b2a55]/28 hover:bg-white"
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name={name}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
            />
            <span>{option}</span>
            <span
              aria-hidden="true"
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                selected ? "border-white/40 bg-white/14" : "border-[#0b2a55]/18"
              }`}
            >
              {selected && <Check size={13} strokeWidth={2.4} />}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function FocusChoices({ value, onChange, onLimit }) {
  const toggle = (option) => {
    if (option === "Prefer not to say") {
      onChange(value.includes(option) ? [] : [option]);
      return;
    }

    const withoutPrivate = value.filter((item) => item !== "Prefer not to say");
    if (withoutPrivate.includes(option)) {
      onChange(withoutPrivate.filter((item) => item !== option));
      return;
    }

    if (withoutPrivate.length >= 2) {
      onLimit();
      return;
    }

    onChange([...withoutPrivate, option]);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Areas to make clearer">
      {FOCUS_OPTIONS.map((option) => {
        const selected = value.includes(option);
        return (
          <label
            key={option}
            className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0b2a55] sm:text-base ${
              selected
                ? "border-[#0b2a55] bg-[#0b2a55] text-white"
                : "border-[#0b2a55]/12 bg-white/72 text-[#173757] hover:border-[#0b2a55]/28 hover:bg-white"
            }`}
          >
            <input
              className="sr-only"
              type="checkbox"
              name="focusAreas"
              value={option}
              checked={selected}
              onChange={() => toggle(option)}
            />
            <span>{option}</span>
            <span
              aria-hidden="true"
              className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                selected ? "border-white/40 bg-white/14" : "border-[#0b2a55]/18"
              }`}
            >
              {selected && <Check size={13} strokeWidth={2.4} />}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function ClarityProfile({ profile, setProfile, onBack, onComplete, track }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const headingRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const copy = STEP_COPY[step];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
    track("clarity_question_viewed", {
      question_number: step + 1,
      question: ["wearable", "focus", "invite"][step],
    });
  }, [step, shouldReduceMotion, track]);

  const update = (patch) => {
    setProfile((current) => ({ ...current, ...patch }));
    setError("");
  };

  const goForward = () => {
    if (step === 0 && !profile.wearable) {
      setError("Pick the closest match so we know what to prioritise.");
      return;
    }

    if (step === 1 && profile.focusAreas.length === 0) {
      setError("Choose at least one thing you want to make clearer.");
      return;
    }

    track(step === 0 ? "wearable_completed" : "focus_completed", {
      wearable: profile.wearable || undefined,
      focus_count: profile.focusAreas.length || undefined,
    });
    setStep((current) => Math.min(current + 1, 2));
  };

  const goBack = () => {
    setError("");
    if (step === 0) onBack();
    else setStep((current) => current - 1);
  };

  const submitInvite = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!profile.market) {
      setError("Tell us which launch path fits you best.");
      return;
    }
    if (!profile.emailConsent) {
      setError("Please choose whether you want early-access emails.");
      return;
    }
    onComplete();
  };

  return (
    <main className="safe-page full-stage bg-[#f7fafa] px-4 pb-10 sm:px-7">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#0b2a55]/10 bg-white/64 shadow-[0_24px_80px_rgba(17,46,74,0.06)] backdrop-blur-sm sm:rounded-[2.75rem]">
        <div className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#755b21]">
              <span className="size-1.5 rounded-full bg-[#c89c3d]" aria-hidden="true" />
              {copy.eyebrow}
            </p>
            <ProgressDots step={step} />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => headingRef.current?.focus({ preventScroll: true })}
            >
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="max-w-3xl text-[clamp(2.3rem,6vw,4.6rem)] font-normal leading-[1] tracking-[-0.045em] text-[#102b49] outline-none"
              >
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5f7284] sm:text-lg">
                {copy.description}
              </p>

              {step === 0 && (
                <div className="mt-9">
                  <RadioChoices
                    name="wearable"
                    value={profile.wearable}
                    onChange={(wearable) => update({ wearable })}
                    options={WEARABLE_OPTIONS}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="mt-9">
                  <div className="mb-3 flex items-center justify-end text-xs font-medium text-[#5f7284]">
                    {profile.focusAreas.length} / 2 selected
                  </div>
                  <FocusChoices
                    value={profile.focusAreas}
                    onChange={(focusAreas) => update({ focusAreas })}
                    onLimit={() => setError("Two is plenty. Pick the ones that matter most.")}
                  />
                </div>
              )}

              {step === 2 && (
                <form id="clarity-invite-form" onSubmit={submitInvite} className="mt-9 space-y-7">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-[#173757]">
                      First name <span className="font-normal text-[#6c7e8f]">(optional)</span>
                      <input
                        type="text"
                        name="firstName"
                        autoComplete="given-name"
                        value={profile.firstName}
                        onChange={(event) => update({ firstName: event.target.value.slice(0, 60) })}
                        placeholder="What should we call you?"
                        className="mt-2 min-h-14 w-full rounded-2xl border border-[#0b2a55]/14 bg-white/84 px-4 text-base text-[#102b49] outline-none transition placeholder:text-[#6c7e8f] focus:border-[#0b2a55] focus:ring-4 focus:ring-[#0b2a55]/10"
                      />
                    </label>
                    <label className="block text-sm font-medium text-[#173757]">
                      Email address
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        value={profile.email}
                        onChange={(event) => update({ email: event.target.value.slice(0, 180) })}
                        placeholder="you@example.com"
                        className="mt-2 min-h-14 w-full rounded-2xl border border-[#0b2a55]/14 bg-white/84 px-4 text-base text-[#102b49] outline-none transition placeholder:text-[#6c7e8f] focus:border-[#0b2a55] focus:ring-4 focus:ring-[#0b2a55]/10"
                      />
                    </label>
                  </div>

                  <fieldset>
                    <legend className="mb-3 text-sm font-medium text-[#173757]">Launch market</legend>
                    <RadioChoices
                      name="market"
                      value={profile.market}
                      onChange={(market) => update({ market })}
                      options={MARKET_OPTIONS}
                    />
                  </fieldset>

                  <div className="space-y-3 border-t border-[#0b2a55]/10 pt-6">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl p-2 text-sm leading-relaxed text-[#36516f] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0b2a55]">
                      <input
                        type="checkbox"
                        name="betaInterest"
                        checked={profile.betaInterest}
                        onChange={(event) => update({ betaInterest: event.target.checked })}
                        className="mt-0.5 size-5 accent-[#0b2a55]"
                      />
                      <span>I’d be open to testing an early beta and sharing honest feedback.</span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl p-2 text-sm leading-relaxed text-[#36516f] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0b2a55]">
                      <input
                        type="checkbox"
                        name="emailConsent"
                        required
                        checked={profile.emailConsent}
                        onChange={(event) => update({ emailConsent: event.target.checked })}
                        className="mt-0.5 size-5 accent-[#0b2a55]"
                      />
                      <span>I want early-access emails from Aeiva. I can opt out anytime.</span>
                    </label>
                  </div>
                </form>
              )}

              <p
                role="alert"
                aria-live="polite"
                className="mt-5 min-h-5 text-sm font-medium text-[#9d3e35]"
              >
                {error}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#0b2a55]/10 bg-[#f7fafa]/70 px-5 py-5 sm:px-10 lg:px-14">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#0b2a55]/12 px-5 text-sm font-medium text-[#173757] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2a55]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
          <span className="order-last w-full text-center text-xs font-medium tracking-[0.12em] text-[#6c7e8f] sm:order-none sm:w-auto">
            QUESTION {step + 1} OF 3
          </span>
          <button
            type={step === 2 ? "submit" : "button"}
            form={step === 2 ? "clarity-invite-form" : undefined}
            onClick={step === 2 ? undefined : goForward}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0b2a55] px-5 text-sm font-medium text-white shadow-[0_12px_26px_rgba(11,42,85,0.16)] transition hover:bg-[#123b70] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c89c3d]"
          >
            {step === 0 && "Next: the why"}
            {step === 1 && "Next: the invite"}
            {step === 2 && "Send me the signal"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </footer>
      </section>

      <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-[#6c7e8f]">
        Preview mode: this funnel is not connected yet. Answers stay in this tab and are not sent or stored.
      </p>
    </main>
  );
}
