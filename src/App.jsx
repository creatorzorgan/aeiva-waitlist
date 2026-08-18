import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Pause, Play } from "lucide-react";
import aeivaLogoUrl from "../assets/aeiva-header-logo.png";
import personHeroPosterUrl from "../assets/person-hero-poster.jpg";
import netherlandsFlagUrl from "../assets/partner-logos/flag-netherlands.svg";
import indiaFlagUrl from "../assets/partner-logos/flag-india.svg";
import ClarityProfile from "./components/ClarityProfile";
import CredibilityRail from "./components/CredibilityRail";
import ThankYouPage from "./components/ThankYouPage";
import { EMPTY_PROFILE, trackFunnelEvent } from "./funnel";

const PERSON_HERO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4";

const FOLLOW_TAU_MS = 58;
const MAX_FOLLOW_X_PX = 16;
const MAX_FOLLOW_Y_PX = 9;
const MAX_ROTATE_X_DEG = 2.25;
const MAX_ROTATE_Y_DEG = 3.25;
const MAX_AURA_X_PX = 24;
const MAX_AURA_Y_PX = 14;
const DESKTOP_VIDEO_SCALE = 1.055;
const MOBILE_VIDEO_SCALE = 1.02;
const FOLLOW_EPSILON = 0.0015;

const TRUST_POINTS = [
  "Personal to you.",
  "Independent by design.",
  "Built for better decisions.",
];

function BackgroundVideo() {
  const videoRef = useRef(null);
  const auraRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const aura = auraRef.current;
    if (!video) return undefined;

    const finePointerQuery = window.matchMedia(
      "(any-hover: hover) and (any-pointer: fine) and (min-width: 1024px)",
    );
    const reducedDataQuery = window.matchMedia("(prefers-reduced-data: reduce)");
    const connection = navigator.connection;
    let animationFrame = null;
    let lastFrameAt = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const canFollowPointer = () =>
      finePointerQuery.matches && !shouldReduceMotion && !isManuallyPaused;

    const applyDepth = (normalX, normalY) => {
      if (!canFollowPointer()) {
        video.style.transform = `translate3d(0, 0, 0) scale3d(${MOBILE_VIDEO_SCALE}, ${MOBILE_VIDEO_SCALE}, 1)`;
        if (aura) aura.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      const translateX = normalX * MAX_FOLLOW_X_PX;
      const translateY = normalY * MAX_FOLLOW_Y_PX;
      const rotateX = normalY * -MAX_ROTATE_X_DEG;
      const rotateY = normalX * MAX_ROTATE_Y_DEG;
      video.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) rotateX(${rotateX.toFixed(3)}deg) rotateY(${rotateY.toFixed(3)}deg) scale3d(${DESKTOP_VIDEO_SCALE}, ${DESKTOP_VIDEO_SCALE}, 1)`;

      if (aura) {
        aura.style.transform = `translate3d(${(normalX * MAX_AURA_X_PX).toFixed(2)}px, ${(normalY * MAX_AURA_Y_PX).toFixed(2)}px, 0)`;
      }
    };

    const renderDepth = (timestamp) => {
      animationFrame = null;
      const elapsed = lastFrameAt === 0 ? 16 : Math.min(timestamp - lastFrameAt, 50);
      lastFrameAt = timestamp;
      const alpha = 1 - Math.exp(-elapsed / FOLLOW_TAU_MS);
      currentX += (targetX - currentX) * alpha;
      currentY += (targetY - currentY) * alpha;
      applyDepth(currentX, currentY);

      if (
        Math.abs(targetX - currentX) > FOLLOW_EPSILON ||
        Math.abs(targetY - currentY) > FOLLOW_EPSILON
      ) {
        animationFrame = window.requestAnimationFrame(renderDepth);
      }
    };

    const scheduleDepth = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(renderDepth);
      }
    };

    const handlePointerMove = (event) => {
      if (
        shouldReduceMotion ||
        !finePointerQuery.matches ||
        (event.pointerType !== "mouse" && event.pointerType !== "pen")
      ) {
        return;
      }

      targetX = Math.max(-1, Math.min(1, (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1));
      scheduleDepth();
    };

    const resetDepth = () => {
      targetX = 0;
      targetY = 0;
      scheduleDepth();
    };

    const syncPlayback = () => {
      const shouldSaveData = reducedDataQuery.matches || Boolean(connection?.saveData);
      if (shouldReduceMotion || shouldSaveData || isManuallyPaused || document.hidden) {
        video.pause();
        return;
      }
      video.play().catch(() => {
        // The 4K poster remains visible when autoplay is unavailable.
      });
    };

    const syncInteractionMode = () => {
      video.style.willChange = canFollowPointer() ? "transform" : "auto";
      resetDepth();
      syncPlayback();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", resetDepth);
    window.addEventListener("resize", syncInteractionMode, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetDepth);
    document.addEventListener("visibilitychange", syncPlayback);
    finePointerQuery.addEventListener("change", syncInteractionMode);
    reducedDataQuery.addEventListener("change", syncPlayback);
    connection?.addEventListener?.("change", syncPlayback);
    applyDepth(0, 0);
    syncInteractionMode();

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      video.pause();
      video.style.willChange = "auto";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", resetDepth);
      window.removeEventListener("resize", syncInteractionMode);
      document.documentElement.removeEventListener("mouseleave", resetDepth);
      document.removeEventListener("visibilitychange", syncPlayback);
      finePointerQuery.removeEventListener("change", syncInteractionMode);
      reducedDataQuery.removeEventListener("change", syncPlayback);
      connection?.removeEventListener?.("change", syncPlayback);
    };
  }, [isManuallyPaused, shouldReduceMotion]);

  return (
    <div className="hero-perspective relative order-2 aspect-[4/5] w-full overflow-hidden bg-[#eef4f5] md:aspect-video lg:absolute lg:inset-0 lg:z-0 lg:h-full lg:aspect-auto">
      <video
        ref={videoRef}
        src={PERSON_HERO_URL}
        poster={personHeroPosterUrl}
        autoPlay={!shouldReduceMotion}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="hero-video relative z-0 h-full w-full object-cover object-right lg:object-right-bottom"
      />
      <div
        ref={auraRef}
        aria-hidden="true"
        className="pointer-events-none absolute -right-[8%] top-[7%] z-[1] hidden size-[58vw] max-h-[760px] max-w-[760px] rounded-full bg-[radial-gradient(circle,rgba(219,241,235,0.34)_0%,rgba(226,201,139,0.12)_38%,rgba(247,250,250,0)_70%)] lg:block motion-reduce:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(247,250,250,0)_55%,rgba(247,250,250,0.18)_100%)] lg:bg-[linear-gradient(90deg,rgba(247,250,250,0.98)_0%,rgba(247,250,250,0.91)_36%,rgba(247,250,250,0.2)_63%,rgba(247,250,250,0)_82%)]"
      />
      {!shouldReduceMotion && (
        <button
          type="button"
          onClick={() => setIsManuallyPaused((paused) => !paused)}
          className="absolute bottom-4 right-4 z-[3] inline-flex min-h-11 items-center gap-2 rounded-full border border-[#0b2a55]/12 bg-[#f7fafa]/90 px-4 text-xs font-medium text-[#173757] shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2a55] lg:bottom-28"
          aria-pressed={isManuallyPaused}
          aria-label={isManuallyPaused ? "Play hero motion" : "Pause hero motion"}
        >
          {isManuallyPaused ? (
            <Play aria-hidden="true" size={14} fill="currentColor" />
          ) : (
            <Pause aria-hidden="true" size={14} fill="currentColor" />
          )}
          <span>{isManuallyPaused ? "Play motion" : "Pause motion"}</span>
        </button>
      )}
    </div>
  );
}

function Navbar({ stage, onHome, onStart }) {
  const stepLabel = stage === "profile" ? "Clarity profile" : "Profile complete";

  return (
    <header className="site-header absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
      <a
        href="/"
        onClick={(event) => {
          event.preventDefault();
          onHome();
        }}
        aria-label="Aeiva home"
        className="aeiva-logo-frame relative block size-[58px] shrink-0 overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b2a55] sm:size-16"
      >
        <img
          src={aeivaLogoUrl}
          alt="Aeiva"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </a>

      {stage === "home" ? (
        <>
          <div
            className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#36516f] md:flex"
            aria-label="Launching in Amsterdam, then Chennai"
          >
            <img
              src={netherlandsFlagUrl}
              alt=""
              width="21"
              height="14"
              className="h-3.5 w-[21px] rounded-[2px] object-cover"
            />
            <span>Amsterdam</span>
            <span aria-hidden="true" className="text-[#a77c27]">→</span>
            <img
              src={indiaFlagUrl}
              alt=""
              width="21"
              height="14"
              className="h-3.5 w-[21px] rounded-[2px] object-cover"
            />
            <span>Chennai</span>
          </div>

          <button
            type="button"
            onClick={() => onStart("nav")}
            className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-[#0b2a55]/12 bg-white/76 px-4 py-2 text-sm font-medium text-[#0b2a55] shadow-sm shadow-[#0b2a55]/5 backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2a55] sm:px-5"
          >
            Make it make sense
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
          </button>
        </>
      ) : (
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-[#36516f]">
          {stepLabel}
        </span>
      )}
    </header>
  );
}

function HeroContent({ onStart }) {
  const shouldReduceMotion = useReducedMotion();
  const revealTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.56, ease: [0.22, 1, 0.36, 1] };

  return (
    <div className="full-stage relative z-10 order-1 flex w-full flex-1 flex-col bg-[#f7fafa] pb-10 pt-24 sm:pt-28 lg:bg-transparent lg:pb-0 lg:pt-0">
      <main
        id="join-aeiva"
        className="hero-safe-content mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-14 sm:px-8 lg:px-10 lg:pb-40 lg:pt-28"
      >
        <div className="w-full max-w-[650px]">
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={revealTransition}
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#755b21]"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#c89c3d]" />
            AEIVA
          </motion.p>

          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...revealTransition, delay: shouldReduceMotion ? 0 : 0.06 }}
            className="max-w-[640px] text-[clamp(2.75rem,7vw,5rem)] font-normal leading-[0.98] tracking-[-0.048em] text-[#102b49]"
          >
            Your health, made clear.
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...revealTransition, delay: shouldReduceMotion ? 0 : 0.12 }}
            className="mt-7 max-w-[590px] text-lg leading-relaxed text-[#50677d] sm:text-xl"
          >
            Aeiva turns the data from your wearable into one clear action for today.
          </motion.p>

          <motion.ul
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...revealTransition, delay: shouldReduceMotion ? 0 : 0.17 }}
            className="my-8 flex max-w-[610px] flex-wrap gap-x-5 gap-y-2 text-sm text-[#36516f]"
            aria-label="Aeiva commitments"
          >
            {TRUST_POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" size={15} strokeWidth={2.2} className="text-[#b8892e]" />
                {point}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...revealTransition, delay: shouldReduceMotion ? 0 : 0.22 }}
          >
            <button
              type="button"
              onClick={() => onStart("hero")}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#0b2a55] px-6 text-base font-medium text-white shadow-[0_14px_34px_rgba(11,42,85,0.16)] transition hover:-translate-y-0.5 hover:bg-[#123b70] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c89c3d]"
            >
              Make my data make sense
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />
            </button>
            <p className="mt-3 text-xs leading-relaxed text-[#5f7284]">
              Takes 45 seconds. No medical history. No spam.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function hasCompleteProfile(profile) {
  return Boolean(
    profile.wearable &&
      profile.focusAreas.length &&
      profile.email &&
      profile.market &&
      profile.emailConsent,
  );
}

function getStageFromHash(canShowWelcome = false) {
  if (typeof window === "undefined") return "home";
  if (window.location.hash === "#profile") return "profile";
  if (window.location.hash === "#welcome" && canShowWelcome) return "thanks";
  return "home";
}

export default function App() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [stage, setStage] = useState(() => getStageFromHash(false));
  const profileComplete = hasCompleteProfile(profile);

  useEffect(() => {
    const syncStage = () => {
      const nextStage = getStageFromHash(profileComplete);
      if (window.location.hash === "#welcome" && nextStage === "home") {
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      }
      setStage(nextStage);
    };

    window.addEventListener("popstate", syncStage);
    window.addEventListener("hashchange", syncStage);
    syncStage();
    return () => {
      window.removeEventListener("popstate", syncStage);
      window.removeEventListener("hashchange", syncStage);
    };
  }, [profileComplete]);

  useEffect(() => {
    const titles = {
      home: "Join Aeiva — Your health, made clear",
      profile: "Your clarity profile — Join Aeiva",
      thanks: "Clarity looks good on you — Aeiva",
    };
    document.title = titles[stage];
    window.scrollTo({ top: 0, behavior: "auto" });
    trackFunnelEvent("funnel_stage_viewed", { stage });
  }, [stage]);

  useEffect(() => {
    trackFunnelEvent("landing_viewed");
  }, []);

  const navigate = (nextStage) => {
    const hash = nextStage === "profile" ? "#profile" : nextStage === "thanks" ? "#welcome" : "";
    const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
    window.history.pushState({}, "", nextUrl);
    setStage(nextStage);
  };

  const startProfile = (placement) => {
    trackFunnelEvent("primary_cta_clicked", { placement });
    trackFunnelEvent("clarity_profile_started", { placement });
    navigate("profile");
  };

  const completeProfile = () => {
    trackFunnelEvent("clarity_profile_preview_completed", {
      wearable: profile.wearable,
      market: profile.market,
      focus_count: profile.focusAreas.length,
      beta_interest: profile.betaInterest,
    });
    navigate("thanks");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="full-stage relative overflow-x-hidden bg-[#f7fafa] font-sans text-[#102b49] antialiased selection:bg-[#ead9ab] selection:text-[#0b2a55]">
        <Navbar stage={stage} onHome={() => navigate("home")} onStart={startProfile} />

        <AnimatePresence mode="wait" initial={false}>
          {stage === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="home-stage full-stage relative flex flex-col lg:block"
            >
              <BackgroundVideo />
              <HeroContent onStart={startProfile} />
              <CredibilityRail />
            </motion.div>
          )}

          {stage === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <ClarityProfile
                profile={profile}
                setProfile={setProfile}
                onBack={() => navigate("home")}
                onComplete={completeProfile}
                track={trackFunnelEvent}
              />
            </motion.div>
          )}

          {stage === "thanks" && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <ThankYouPage
                profile={profile}
                onHome={() => navigate("home")}
                track={trackFunnelEvent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
