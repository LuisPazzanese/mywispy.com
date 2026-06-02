// Shared type for all translation files. Adding a new language is: copy en.ts,
// translate the strings, register the import in index.ts.

export interface Translations {
  meta: {
    title: string;
    description: string;
    skipLink: string;
    langToggleAria: string;
  };
  nav: {
    primary: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: [string, string, string];
    linkGithub: string;
    linkLinkedin: string;
    linkEmail: string;
    linkCV: string;
    /** Language-specific resume PDF served from /public. */
    cvHref: string;
  };
  sections: {
    about: string;
    experience: string;
    education: string;
    projects: string;
    writeups: string;
    skills: string;
    contact: string;
  };
  about: {
    /** Rendered as innerHTML — contains an <a href="#education"> link. */
    body: string;
    intl: string;
  };
  experience: {
    role: string;
    when: string;
    about: string;
    bullets: [string, string, string, string];
  };
  education: {
    degree: string;
    when: string;
    courseworkLabel: string;
    courseworkBody: string;
    intlSubheading: string;
    intlItems: [string, string, string];
    preUniSubheading: string;
    preUniItems: [string];
  };
  projects: {
    embeddedTitle: string;
    embeddedTag: string;
    otherTitle: string;
    fullRepoList: string;
    descriptions: {
      airMouse: string;
      stepper: string;
      rtos: string;
      adc: string;
      ultrasonic: string;
      buzzer: string;
      ninja: string;
      retro: string;
    };
  };
  writeups: {
    /** Rendered as innerHTML — contains a <span class="strong"> highlight. */
    intro: string;
    placeholderTitle: string;
    placeholderSub: string;
  };
  skills: {
    languages: { label: string; value: string };
    embedded: { label: string; value: string };
    protocols: { label: string; value: string };
    web: { label: string; value: string };
    tools: { label: string; value: string };
    security: { label: string; value: string };
    spoken: { label: string; value: string };
  };
  contact: {
    emailLabel: string;
    linkedinLabel: string;
    githubLabel: string;
    locationLabel: string;
    locationValue: string;
    footer: string;
  };
  notFound: {
    code: string;
    heading: string;
    body: string;
    backHome: string;
    backHomeAria: string;
  };
}

export type LangCode = 'en' | 'pt';
