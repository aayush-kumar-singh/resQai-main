import type { StatCard } from '../../hooks/useUserLanding'

interface HeroSectionProps {
  statCards: StatCard[]
}

export const HeroSection = ({ statCards }: HeroSectionProps) => (
  <section className="hero-section" id="hero-section">
    <div className="hero-glow hero-glow-1" />
    <div className="hero-glow hero-glow-2" />

    <div className="hero-content">
      <p className="hero-eyebrow">AI-Powered Disaster Response Platform</p>
      <h1 className="hero-headline">
        Every Signal Matters.<br />
        <span className="hero-highlight">Every Second Counts.</span>
      </h1>
      <p className="hero-description">
        ResQAI transforms unstructured distress signals into prioritized, map-based rescue actions
        in real time — connecting citizens, volunteers, and emergency teams through AI-driven triage
        and coordination.
      </p>
    </div>

    <div className="hero-stats" id="hero-stats">
      {statCards.map(card => (
        <article key={card.label} className="stat-card">
          <span className="stat-icon">{card.icon}</span>
          <p className="stat-value">{card.value}<span className="stat-suffix">{card.suffix}</span></p>
          <p className="stat-label">{card.label}</p>
        </article>
      ))}
    </div>
  </section>
)
