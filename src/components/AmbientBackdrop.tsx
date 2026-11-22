export function AmbientBackdrop() {
  return (
    <>
      {/* Global subtle optical refraction filter for focal desktop floating glass backdrops */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed h-0 w-0 opacity-0"
        focusable="false"
      >
        <defs>
          <filter
            id="liquid-glass-refract"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="1.2" result="softNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="softNoise"
              scale="3.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Depth-rich architectural daylight ambient mesh & slow-drifting refracting orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#ECEFED]"
      >
        {/* Base atmospheric architectural mesh */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 80% at 12% 0%, rgba(255,255,255,0.88) 0%, rgba(238,242,239,0.52) 48%, rgba(226,232,229,0.75) 100%)',
          }}
        />

        {/* Orb 1: Architectural Forest / Sage Mist (top-left) */}
        <div
          className="ambient-orb-1 absolute -left-32 -top-28 h-[520px] w-[520px] rounded-full opacity-75 blur-[95px]"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, rgba(27, 67, 50, 0.24) 0%, rgba(62, 118, 92, 0.14) 50%, transparent 74%)',
          }}
        />

        {/* Orb 2: Warm Travertine & Brushed Bronze Glow (top-right) */}
        <div
          className="ambient-orb-2 absolute -right-24 top-16 h-[540px] w-[540px] rounded-full opacity-75 blur-[100px]"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(168, 128, 82, 0.22) 0%, rgba(214, 188, 154, 0.16) 52%, transparent 75%)',
          }}
        />

        {/* Orb 3: Nordic Mineral Slate Blue (mid-left behind carousel & chat) */}
        <div
          className="ambient-orb-3 absolute -left-20 top-[46%] h-[560px] w-[560px] rounded-full opacity-70 blur-[110px]"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(82, 118, 138, 0.22) 0%, rgba(154, 184, 198, 0.14) 52%, transparent 75%)',
          }}
        />

        {/* Orb 4: Soft Sage & Champagne Pearl (bottom-right behind shoppable index) */}
        <div
          className="ambient-orb-4 absolute -bottom-36 right-[6%] h-[580px] w-[580px] rounded-full opacity-75 blur-[110px]"
          style={{
            background:
              'radial-gradient(circle at 45% 45%, rgba(27, 67, 50, 0.18) 0%, rgba(182, 152, 110, 0.15) 48%, transparent 74%)',
          }}
        />

        {/* Subtle overhead daylight specular wash */}
        <div
          className="absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
      </div>
    </>
  );
}
