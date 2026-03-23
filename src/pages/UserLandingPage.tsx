import { StickyHeader } from '../components/user/StickyHeader'
import { HeroSection } from '../components/user/HeroSection'
import { HowItWorks } from '../components/user/HowItWorks'
import { LiveHelplinePanel } from '../components/user/LiveHelplinePanel'
import { CitizenPortal } from '../components/user/CitizenPortal'
import { SafetyGuide } from '../components/user/SafetyGuide'
import { Chatbot } from '../components/user/Chatbot'
import { useUserLanding } from '../hooks/useUserLanding'
import '../styles/chatbot.css'

export const UserLandingPage = () => {
  const landing = useUserLanding()

  return (
    <div className="landing-shell">
      <StickyHeader
        tickerMessages={landing.tickerMessages}
        clock={landing.clock}
        activeIncidents={landing.activeIncidents}
      />

      <main className="landing-main">
        <HeroSection statCards={landing.statCards} />
        <HowItWorks />
        <LiveHelplinePanel helplines={landing.helplines} />
        <CitizenPortal
          activeTab={landing.activeTab}
          setActiveTab={landing.setActiveTab}
          incidentDraft={landing.incidentDraft}
          submittedIncidents={landing.submittedIncidents}
          lastSubmittedId={landing.lastSubmittedId}
          submitStatusMsg={landing.submitStatusMsg}
          isSubmitting={landing.isSubmitting}
          updateIncidentField={landing.updateIncidentField}
          submitIncident={landing.submitIncident}
          disasterOptions={landing.disasterOptions}
          trackingId={landing.trackingId}
          setTrackingId={landing.setTrackingId}
          trackedReport={landing.trackedReport}
          trackReport={landing.trackReport}
          volunteer={landing.volunteer}
          volunteerSubmitted={landing.volunteerSubmitted}
          updateVolunteerField={landing.updateVolunteerField}
          toggleSkill={landing.toggleSkill}
          submitVolunteer={landing.submitVolunteer}
          availableSkills={landing.availableSkills}
          districts={landing.districts}
          helplines={landing.helplines}
        />
        <SafetyGuide />
      </main>

      <Chatbot />

      <footer className="landing-footer">
        <p>© 2026 ResQAI — AI-Powered Disaster Response Platform</p>
        <p>Built for citizens, by citizens. Every signal matters.</p>
      </footer>
    </div>
  )
}
