import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <main className="text-center max-w-4xl mx-auto">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="text-[#e94560]">Shadow</span>
            <span className="text-[#eaeaea]">Rank</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#9ca3af]">
            The Real-Life RPG
          </p>
        </div>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-[#9ca3af] mb-12 max-w-2xl mx-auto">
          Turn your daily habits into epic quests. Gain XP, level up your Hunter Rank,
          and compete with friends. <span className="text-[#e94560]">Are you ready to rise?</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/login"
            className="px-8 py-4 bg-[#e94560] text-white font-semibold rounded-lg
                       hover:bg-[#ff6b6b] transition-all duration-200
                       shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50
                       text-lg"
          >
            Start Your Journey
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-4 border border-[#374151] text-[#eaeaea] font-semibold rounded-lg
                       hover:border-[#e94560] hover:text-[#e94560] transition-all duration-200
                       text-lg"
          >
            View Leaderboard
          </Link>
        </div>

        {/* Hunter Ranks Preview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-[#eaeaea]">Hunter Ranks</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="rank-badge rank-e">E-Rank</span>
            <span className="rank-badge rank-d">D-Rank</span>
            <span className="rank-badge rank-c">C-Rank</span>
            <span className="rank-badge rank-b">B-Rank</span>
            <span className="rank-badge rank-a">A-Rank</span>
            <span className="rank-badge rank-s">S-Rank</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="quest-card p-6 rounded-xl">
            <div className="text-3xl mb-4">&#9876;</div>
            <h3 className="text-xl font-bold mb-2 text-[#e94560]">Daily Quests</h3>
            <p className="text-[#9ca3af]">
              Create custom habits and earn XP for completing them. Study, gym, coding - everything counts.
            </p>
          </div>

          <div className="quest-card p-6 rounded-xl">
            <div className="text-3xl mb-4">&#11014;</div>
            <h3 className="text-xl font-bold mb-2 text-[#e94560]">Level Up</h3>
            <p className="text-[#9ca3af]">
              Gain experience and watch your Hunter Rank rise from E to the legendary S-Rank.
            </p>
          </div>

          <div className="quest-card p-6 rounded-xl">
            <div className="text-3xl mb-4">&#127942;</div>
            <h3 className="text-xl font-bold mb-2 text-[#e94560]">Compete</h3>
            <p className="text-[#9ca3af]">
              See how you stack up against friends on the global leaderboard. Claim your throne.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 pb-8 text-center text-[#6b7280]">
        <p>Built for hunters who refuse to stay ordinary.</p>
      </footer>
    </div>
  );
}
