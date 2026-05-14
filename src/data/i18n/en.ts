import type { Translations } from './types';

export const en: Translations = {
  meta: {
    title: 'Luis Pazzanese — Computer Engineer',
    description:
      'Portfolio of Luis Fernando Pazzanese Pinheiro, Computer Engineering student at Insper focused on embedded systems, cybersecurity, and low-level programming.',
    skipLink: 'Skip to content',
    langToggleAria: 'Switch language',
  },
  nav: {
    primary: 'Primary',
  },
  hero: {
    eyebrow: 'luis@mywispy:~$ whoami',
    title: 'Computer Engineer',
    subtitle: ['Embedded Systems', 'Cybersecurity', 'Low-level Programming'],
    linkGithub: 'GitHub',
    linkLinkedin: 'LinkedIn',
    linkEmail: 'Email',
  },
  sections: {
    about: 'about',
    experience: 'experience',
    education: 'education',
    projects: 'projects',
    writeups: 'ctf writeups',
    skills: 'skills',
    contact: 'contact',
  },
  about: {
    body:
      'Computer Engineering student at <a href="#education">Insper</a> (5th semester, ' +
      'graduating 2028). Focused on embedded systems, cybersecurity, and low-level ' +
      'programming. Experienced in building real-time systems with FreeRTOS on ARM ' +
      'microcontrollers and developing automation tools for the financial industry. ' +
      "Rank 2 in Insper's cybersecurity club (Insper SEC) CTF competitions.",
    intl:
      'International background: MIT NuVu Program (USA), CATS College Cambridge (UK), ' +
      'ELS Language Centers (Canada).',
  },
  experience: {
    role: 'Intern',
    when: 'Mar 2025 — Sep 2025',
    about:
      'Zagros Capital is an independent real estate asset manager with R$2B+ AUM, based in São Paulo.',
    bullets: [
      'Built an automated reporting dashboard using Python and Streamlit for internal fund metrics.',
      'Developed Python automation scripts to streamline back office Excel workflows.',
      'Structured and processed financial market datasets.',
      'Supported portfolio management and internal analysis workflows.',
    ],
  },
  education: {
    degree: 'BSc in Computer Engineering',
    when: '2023 — 2028 · 5th semester',
    courseworkLabel: 'Relevant coursework:',
    courseworkBody:
      'Embedded Systems, Computer Architecture, Data Science, Software Design, ' +
      'Agile Development, Calculus I-III, Physics I-III.',
    intlSubheading: 'International Education',
    intlItems: [
      'MIT NuVu Program — USA',
      'CATS College Cambridge — UK (1 semester of high school)',
      'ELS Language Centers — Canada',
    ],
    preUniSubheading: 'Pre-university',
    preUniItems: [
      'ITA-track prep course (1 year) — competitive engineering entrance preparation',
    ],
  },
  projects: {
    embeddedTitle: 'Embedded Systems',
    embeddedTag: 'Raspberry Pi Pico 2 · RP2350',
    otherTitle: 'Other Projects',
    fullRepoList: 'Full repository list:',
    descriptions: {
      airMouse:
        'MPU6050 sensor fusion + AHRS + FreeRTOS (4 tasks / 3 queues / 1 semaphore) with a Python host bridge.',
      stepper:
        'ILI9341 touchscreen with custom GFX driver controlling a unipolar stepper motor and an animated UI.',
      rtos:
        'FreeRTOS scaffold: 4 tasks synchronized via a binary-semaphore ring on RP2350.',
      adc: 'FreeRTOS ADC-to-UART pipeline with an auto-grading rubric.',
      ultrasonic:
        'Non-blocking HC-SR04 ultrasonic ranging using SDK alarms and GPIO IRQs with a serial CLI.',
      buzzer: 'IRQ-driven 2-button buzzer tone generator with software debounce.',
      ninja: 'State-machine card-matching reflex game.',
      retro: 'Batocera emulation setup on Raspberry Pi 5.',
    },
  },
  writeups: {
    intro:
      'Rank 2 in <span class="strong">Insper SEC</span> — Insper\'s cybersecurity ' +
      'club — across internal CTF competitions. Focus areas: web exploitation ' +
      '(SQLi, XSS, SSRF), with some crypto and misc.',
    placeholderTitle: 'Writeups coming soon.',
    placeholderSub: '6-7 challenges from past CTFs queued for write-up.',
  },
  skills: {
    languages: {
      label: 'Languages',
      value: 'Python · C · x86 Assembly · JavaScript',
    },
    embedded: {
      label: 'Embedded',
      value: 'Raspberry Pi Pico 2 (RP2350) · FreeRTOS · bare-metal ARM',
    },
    protocols: {
      label: 'Protocols',
      value: 'I2C · SPI · UART · GPIO · ADC · PWM',
    },
    web: {
      label: 'Web',
      value: 'React · HTML · CSS',
    },
    tools: {
      label: 'Tools',
      value: 'GDB · Git · Linux · Wireshark · VirtualBox · Streamlit',
    },
    security: {
      label: 'Security',
      value: 'CTF competitions · Web exploitation · Penetration testing',
    },
    spoken: {
      label: 'Spoken',
      value: 'Portuguese (native) · English (advanced)',
    },
  },
  contact: {
    emailLabel: 'Email',
    linkedinLabel: 'LinkedIn',
    githubLabel: 'GitHub',
    locationLabel: 'Location',
    locationValue: 'São Paulo, Brazil',
    footer: 'built with Astro + Three.js',
  },
};
