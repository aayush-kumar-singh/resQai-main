const STEPS = [
  { icon: '📡', title: 'Signal Ingestion', desc: 'Distress reports from citizens, social media, and IoT sensors are captured in real time.' },
  { icon: '🤖', title: 'AI Triage', desc: 'Our AI engine scores severity, identifies disaster type, and prioritizes each signal instantly.' },
  { icon: '🗺️', title: 'Rescue Mapped', desc: 'Incidents are plotted on a live map with hotspot clustering and route optimization.' },
  { icon: '🚒', title: 'Teams Dispatched', desc: 'Nearest available rescue teams are alerted and dispatched with full situational context.' },
]

export const HowItWorks = () => (
  <section className="how-section" id="how-it-works">
    <h2 className="section-title">How It Works</h2>
    <p className="section-subtitle">From signal to rescue in under 5 minutes</p>

    <div className="steps-track">
      {STEPS.map((step, i) => (
        <div key={step.title} className="step-wrapper">
          <article className="step-card">
            <span className="step-number">0{i + 1}</span>
            <span className="step-icon">{step.icon}</span>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-desc">{step.desc}</p>
          </article>
          {i < STEPS.length - 1 && (
            <div className="step-connector">
              <span className="connector-line" />
              <span className="connector-arrow">→</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </section>
)
