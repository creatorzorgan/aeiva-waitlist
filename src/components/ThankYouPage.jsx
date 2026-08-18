import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, Share2 } from "lucide-react";

const PRODUCT_STEPS = [
  ["Connect your signals", "Bring your wearable data into one clearer view."],
  ["Find what matters", "Aeiva looks for the patterns worth your attention."],
  ["Know what to do today", "Get one useful move instead of another dashboard."],
];

export default function ThankYouPage({ profile, onHome, track }) {
  const [shareStatus, setShareStatus] = useState("");
  const headingRef = useRef(null);
  const firstName = profile.firstName.trim();
  const focus = profile.focusAreas.filter((item) => item !== "Prefer not to say");
  const focusText = focus.length ? focus.join(" and ").toLowerCase() : "your health signals";
  const wearableText = profile.wearable || "wearable";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    const data = {
      title: "Aeiva — Your health, made clear",
      text: "For anyone with health data and zero idea what to do with it: Aeiva.",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
        setShareStatus("Shared. Nice work.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus("Link copied.");
      }
      track("share_clicked");
    } catch (error) {
      if (error?.name !== "AbortError") setShareStatus("Couldn’t copy it. Try again.");
    }
  };

  return (
    <main className="safe-page full-stage bg-[#f7fafa] px-4 pb-12 sm:px-7">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#0b2a55]/10 bg-white/70 shadow-[0_24px_80px_rgba(17,46,74,0.06)] sm:rounded-[2.75rem]">
        <section className="bg-[#0b2a55] px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-14">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#ead9ab]">
            <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
              <Check size={13} aria-hidden="true" />
            </span>
            CLARITY PROFILE COMPLETE
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-6 max-w-3xl text-[clamp(2.6rem,7vw,5rem)] font-normal leading-[0.98] tracking-[-0.05em] outline-none"
          >
            {firstName ? `Nice, ${firstName}.` : "Nice."} Clarity looks good on you.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">
            This preview shows how {wearableText} support and clearer {focusText} could shape your Aeiva experience—one useful action at a time.
          </p>
        </section>

        <section className="px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <div className="rounded-2xl border border-[#c89c3d]/26 bg-[#fbf6e9] px-4 py-3 text-sm leading-relaxed text-[#755b21]">
            Working preview: nothing was submitted or stored. Connect the waitlist destination to turn this confirmation live.
          </div>

          <div className="mt-12">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#755b21]">WHAT AEIVA DOES</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-normal tracking-[-0.035em] text-[#102b49] sm:text-4xl">
              Less dashboard. More direction.
            </h2>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {PRODUCT_STEPS.map(([title, description], index) => (
                <article key={title} className="rounded-3xl border border-[#0b2a55]/10 bg-[#f7fafa] p-5">
                  <span className="text-xs font-semibold tracking-[0.18em] text-[#a77c27]">0{index + 1}</span>
                  <h3 className="mt-5 text-lg font-medium text-[#102b49]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5f7284]">{description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-5 border-t border-[#0b2a55]/10 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#755b21]">WHAT TO EXPECT</p>
              <h2 className="mt-4 text-3xl font-normal tracking-[-0.035em] text-[#102b49]">
                Early access, without the hard sell.
              </h2>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[#36516f]">
                {[
                  "Launch invitations begin with Amsterdam, followed by Chennai.",
                  "Early members help shape what Aeiva makes clear first.",
                  "No affiliate-funded recommendations. That part is non-negotiable.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 shrink-0 text-[#b8892e]" size={16} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-3xl bg-[#eef3f0] p-6 sm:p-7">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#36516f]">PASS IT ON</p>
              <h2 className="mt-4 text-2xl font-normal leading-tight tracking-[-0.03em] text-[#102b49]">
                Know someone with six health apps and zero answers?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5f7284]">Send them some clarity. No fake queue boosts attached.</p>
              <button
                type="button"
                onClick={share}
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0b2a55] px-5 text-sm font-medium text-white transition hover:bg-[#123b70] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c89c3d]"
              >
                {navigator.share ? <Share2 size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                Send them some clarity
              </button>
              <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs font-medium text-[#36516f]">
                {shareStatus}
              </p>
            </aside>
          </div>

          <button
            type="button"
            onClick={onHome}
            className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#0b2a55]/12 px-4 text-sm font-medium text-[#173757] transition hover:bg-[#f7fafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2a55]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Aeiva
          </button>
        </section>
      </div>
    </main>
  );
}
