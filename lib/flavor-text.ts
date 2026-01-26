import type { AgentPersona } from '@/lib/graph/simulation/types';

type PersonaType = 'developer' | 'founder' | 'designer' | 'generic';

const DEVELOPER_THOUGHTS = [
  "Resolving handshake dependencies...",
  "Compiling small talk module...",
  "Optimizing wit latency...",
  "Refactoring conversation tree...",
  "Running social_skills.exe...",
  "Debugging awkward silence handler...",
  "Parsing their tech stack...",
  "Spawning charm subprocess...",
  "Caching shared interests...",
  "Garbage collecting bad jokes...",
  "Async loading conversation topics...",
  "Hotswapping personality modules...",
  "Benchmarking rapport metrics...",
  "Initializing empathy runtime...",
  "Building connection graph...",
];

const FOUNDER_THOUGHTS = [
  "Calculating ROI of this hello...",
  "Validating market fit of this joke...",
  "Pivoting to casual tone...",
  "Fundraising for more charisma...",
  "A/B testing conversation openers...",
  "Scaling rapport operations...",
  "Acquiring user attention...",
  "Iterating on small talk MVP...",
  "Burn rate on awkwardness: nominal...",
  "Product-market fitting this vibe...",
  "Series A charm round initiated...",
  "Disrupting traditional networking...",
  "Growth hacking this convo...",
  "OKRs for connection: on track...",
  "Synergizing mutual interests...",
];

const DESIGNER_THOUGHTS = [
  "Wireframing conversation flow...",
  "Kerning the small talk...",
  "Adjusting social spacing...",
  "Prototyping rapport...",
  "User testing this interaction...",
  "Iterating on vibe hierarchy...",
  "Pixel-perfecting this hello...",
  "Designing delight moments...",
  "Crafting the user journey...",
  "Balancing visual chemistry...",
  "Typography of tone: checking...",
  "Mood boarding this convo...",
  "Accessibility of humor: verified...",
  "Design system for banter: loaded...",
  "Responsive charm layout...",
];

const GENERIC_THOUGHTS = [
  "Processing social cues...",
  "Optimizing conversation flow...",
  "Analyzing shared interests...",
  "Calibrating enthusiasm levels...",
  "Loading relevant topics...",
  "Synthesizing clever response...",
  "Mapping connection potential...",
  "Tuning engagement parameters...",
  "Cross-referencing backgrounds...",
  "Generating authentic rapport...",
  "Evaluating chemistry signals...",
  "Scanning for common ground...",
  "Activating networking mode...",
  "Harmonizing conversation vibes...",
  "Indexing mutual connections...",
];

/**
 * Detect persona type from tagline and skills
 */
function detectPersonaType(persona: AgentPersona): PersonaType {
  const tagline = (persona.identity?.tagline || '').toLowerCase();
  const skills = (persona.skills_possessed || []).join(' ').toLowerCase();
  const combined = `${tagline} ${skills}`;

  // Developer detection
  if (
    combined.includes('developer') ||
    combined.includes('engineer') ||
    combined.includes('software') ||
    combined.includes('backend') ||
    combined.includes('frontend') ||
    combined.includes('fullstack') ||
    combined.includes('devops') ||
    combined.includes('programmer')
  ) {
    return 'developer';
  }

  // Founder detection
  if (
    combined.includes('founder') ||
    combined.includes('ceo') ||
    combined.includes('cto') ||
    combined.includes('coo') ||
    combined.includes('co-founder') ||
    combined.includes('entrepreneur') ||
    combined.includes('startup')
  ) {
    return 'founder';
  }

  // Designer detection
  if (
    combined.includes('designer') ||
    combined.includes('ux') ||
    combined.includes('ui') ||
    combined.includes('product design') ||
    combined.includes('creative')
  ) {
    return 'designer';
  }

  return 'generic';
}

/**
 * Get a random thought based on persona type
 */
function getRandomThought(thoughts: string[]): string {
  return thoughts[Math.floor(Math.random() * thoughts.length)];
}

/**
 * Generate a personalized "thinking" message based on the user's persona
 */
export function getAgentThought(persona: AgentPersona): string {
  const personaType = detectPersonaType(persona);

  switch (personaType) {
    case 'developer':
      return getRandomThought(DEVELOPER_THOUGHTS);
    case 'founder':
      return getRandomThought(FOUNDER_THOUGHTS);
    case 'designer':
      return getRandomThought(DESIGNER_THOUGHTS);
    default:
      return getRandomThought(GENERIC_THOUGHTS);
  }
}

/**
 * Get the persona type label for display
 */
export function getPersonaTypeLabel(persona: AgentPersona): string {
  const type = detectPersonaType(persona);
  return type.charAt(0).toUpperCase() + type.slice(1);
}
