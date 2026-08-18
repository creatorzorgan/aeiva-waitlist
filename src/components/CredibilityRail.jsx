import { MapPin } from "lucide-react";
import demonstratorLabUrl from "../../assets/partner-logos/demonstrator-lab.svg";
import startupVillageUrl from "../../assets/partner-logos/startup-village.webp";
import googleForStartupsUrl from "../../assets/partner-logos/google-for-startups.jpg";
import cloudflareUrl from "../../assets/partner-logos/cloudflare.svg";
import attioUrl from "../../assets/partner-logos/attio.svg";
import netherlandsFlagUrl from "../../assets/partner-logos/flag-netherlands.svg";
import indiaFlagUrl from "../../assets/partner-logos/flag-india.svg";

const BACKER_LOGOS = [
  {
    name: "Demonstrator Lab",
    src: demonstratorLabUrl,
    className: "max-h-9 max-w-[108px]",
  },
  {
    name: "Startup Village",
    src: startupVillageUrl,
    className: "max-h-9 max-w-[112px]",
  },
  {
    name: "Google for Startups",
    src: googleForStartupsUrl,
    className: "max-h-8 max-w-[130px]",
  },
  {
    name: "Cloudflare",
    src: cloudflareUrl,
    className: "max-h-7 max-w-[110px]",
  },
  {
    name: "Attio",
    src: attioUrl,
    className: "size-7",
    showName: true,
  },
];

function BackerGrid() {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[#755b21]">
          Backed by
        </p>
        <p className="text-[0.6875rem] leading-relaxed text-[#5f7284]">
          Grants, programs & infrastructure supporting Aeiva
        </p>
      </div>
      <ul
        className="mt-4 grid grid-cols-2 items-center gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5"
        aria-label="Organizations supporting Aeiva through grants, programs, and infrastructure"
      >
        {BACKER_LOGOS.map((logo) => (
          <li
            key={logo.name}
            title={logo.name}
            className="flex h-14 min-w-0 items-center justify-center rounded-xl border border-[#0b2a55]/8 bg-white/72 px-2.5 last:col-span-2 sm:last:col-span-1"
          >
            <img
              src={logo.src}
              alt={logo.showName ? "" : logo.name}
              width="120"
              height="40"
              loading="eager"
              decoding="async"
              className={`block shrink-0 object-contain ${logo.className}`}
            />
            {logo.showName && (
              <span className="ml-2 text-sm font-medium tracking-[-0.02em] text-[#102b49]">
                {logo.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CredibilityRail() {
  return (
    <section
      aria-labelledby="aeiva-ecosystem-heading"
      className="credibility-rail relative z-10 order-3 border-t border-[#0b2a55]/10 bg-[#f7fafa]/[0.98] px-5 py-6 sm:px-8 lg:px-10 lg:py-5"
    >
      <h2 id="aeiva-ecosystem-heading" className="sr-only">
        Organizations supporting Aeiva through grants, programs, and infrastructure
      </h2>

      <div className="mx-auto grid w-full max-w-7xl gap-7 lg:grid-cols-[1fr_0.35fr] lg:items-center lg:gap-9">
        <BackerGrid />

        <div className="border-t border-[#0b2a55]/10 pt-5 lg:border-l lg:border-t-0 lg:py-1 lg:pl-8 lg:pt-0">
          <div
            className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#36516f]"
            aria-label="Launching in Amsterdam, then Chennai"
          >
            <img
              src={netherlandsFlagUrl}
              alt=""
              width="24"
              height="16"
              className="h-3.5 w-[21px] rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(11,42,85,0.1)]"
            />
            <span>Amsterdam</span>
            <span aria-hidden="true" className="text-[#a77c27]">→</span>
            <img
              src={indiaFlagUrl}
              alt=""
              width="24"
              height="16"
              className="h-3.5 w-[21px] rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(11,42,85,0.1)]"
            />
            <span>Chennai</span>
          </div>

          <address className="mt-3 flex max-w-sm items-start gap-2 not-italic text-xs leading-relaxed text-[#5f7284]">
            <MapPin aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-[#a77c27]" />
            <span>Science Park 608, 1098 XH Amsterdam, Netherlands</span>
          </address>
        </div>
      </div>
    </section>
  );
}
