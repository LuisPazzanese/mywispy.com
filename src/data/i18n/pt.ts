import type { Translations } from './types';

// Brazilian Portuguese. Technical terms (FreeRTOS, I2C, ARM, RP2350, etc.) and
// proper nouns (Insper, MIT NuVu, etc.) are intentionally kept in English.

export const pt: Translations = {
  meta: {
    title: 'Luis Pazzanese — Engenheiro · Embarcados & Cibersegurança',
    description:
      'Portfólio de Luis Fernando Pazzanese Pinheiro, estudante de Engenharia de Computação no Insper, com foco em sistemas embarcados, cibersegurança e programação de baixo nível.',
    skipLink: 'Pular para o conteúdo',
    langToggleAria: 'Trocar idioma',
  },
  nav: {
    primary: 'Principal',
  },
  hero: {
    eyebrow: 'luis@mywispy:~$ whoami',
    title: 'Engenheiro de Computação',
    subtitle: ['Sistemas Embarcados', 'Cibersegurança', 'Programação de Baixo Nível'],
    linkGithub: 'GitHub',
    linkLinkedin: 'LinkedIn',
    linkEmail: 'Email',
    linkCV: 'Currículo',
  },
  sections: {
    about: 'sobre',
    experience: 'experiência',
    education: 'formação',
    projects: 'projetos',
    writeups: 'writeups de ctf',
    skills: 'habilidades',
    contact: 'contato',
  },
  about: {
    body:
      'Estudante de Engenharia de Computação no <a href="#education">Insper</a> ' +
      '(5º semestre, formatura prevista para 2028). Foco em sistemas embarcados, ' +
      'cibersegurança e programação de baixo nível. Experiência construindo sistemas ' +
      'de tempo real com FreeRTOS em microcontroladores ARM e desenvolvendo ' +
      'automações para o mercado financeiro. Competidor de destaque no Insper SEC ' +
      '(clube de cibersegurança do Insper) em competições de CTF.',
    intl:
      'Vivência internacional: MIT NuVu Program (EUA), CATS College Cambridge (Reino Unido), ' +
      'ELS Language Centers (Canadá).',
  },
  experience: {
    role: 'Estagiário',
    when: 'Mar 2025 — Set 2025',
    about:
      'A Zagros Capital é uma gestora independente de ativos imobiliários com mais de R$2B sob gestão, sediada em São Paulo.',
    bullets: [
      'Desenvolvi um dashboard automatizado de reporting em Python e Streamlit para métricas internas dos fundos.',
      'Criei scripts de automação em Python para otimizar fluxos de back office em Excel.',
      'Estruturei e processei datasets do mercado financeiro.',
      'Apoiei a gestão de portfólio e os fluxos internos de análise.',
    ],
  },
  education: {
    degree: 'Bacharelado em Engenharia de Computação',
    when: '2023 — 2028 · 5º semestre',
    courseworkLabel: 'Disciplinas relevantes:',
    courseworkBody:
      'Sistemas Embarcados, Arquitetura de Computadores, Ciência de Dados, Design de Software, ' +
      'Desenvolvimento Ágil, Cálculo I-III, Física I-III.',
    intlSubheading: 'Formação Internacional',
    intlItems: [
      'MIT NuVu Program — EUA',
      'CATS College Cambridge — Reino Unido (1 semestre de ensino médio)',
      'ELS Language Centers — Canadá',
    ],
    preUniSubheading: 'Pré-universitário',
    preUniItems: [
      'Curso preparatório para ITA (1 ano) — preparação para vestibulares de engenharia',
    ],
  },
  projects: {
    embeddedTitle: 'Sistemas Embarcados',
    embeddedTag: 'Raspberry Pi Pico 2 · RP2350',
    otherTitle: 'Outros Projetos',
    fullRepoList: 'Lista completa de repositórios:',
    descriptions: {
      airMouse:
        'Fusão de sensores MPU6050 + AHRS + FreeRTOS (4 tasks / 3 filas / 1 semáforo) com ponte Python no host.',
      stepper:
        'Touchscreen ILI9341 com driver GFX próprio controlando motor de passo unipolar e UI animada.',
      rtos:
        'Esqueleto em FreeRTOS: 4 tasks sincronizadas por um anel de semáforos binários no RP2350.',
      adc: 'Pipeline ADC-para-UART em FreeRTOS com rubrica de auto-correção.',
      ultrasonic:
        'Medição ultrassônica HC-SR04 não-bloqueante usando alarmes do SDK e IRQs de GPIO, com CLI serial.',
      buzzer: 'Gerador de tons com 2 botões via IRQ e debounce em software.',
      ninja: 'Jogo de reflexo baseado em máquina de estados e correspondência de cartas.',
      retro: 'Setup de emulação Batocera em Raspberry Pi 5.',
    },
  },
  writeups: {
    intro:
      'Competidor de destaque no <span class="strong">Insper SEC</span> — clube de ' +
      'cibersegurança do Insper — em competições internas de CTF. Foco: exploração ' +
      'web (SQLi, XSS, SSRF), com algumas categorias de cripto e misc.',
    placeholderTitle: 'Writeups em breve.',
    placeholderSub: '6-7 desafios de CTFs anteriores na fila para serem documentados.',
  },
  skills: {
    languages: {
      label: 'Linguagens',
      value: 'Python · C · Assembly x86 · JavaScript',
    },
    embedded: {
      label: 'Embarcados',
      value: 'Raspberry Pi Pico 2 (RP2350) · FreeRTOS · ARM bare-metal',
    },
    protocols: {
      label: 'Protocolos',
      value: 'I2C · SPI · UART · GPIO · ADC · PWM',
    },
    web: {
      label: 'Web',
      value: 'React · HTML · CSS',
    },
    tools: {
      label: 'Ferramentas',
      value: 'GDB · Git · Linux · Wireshark · VirtualBox · Streamlit',
    },
    security: {
      label: 'Segurança',
      value: 'Competições de CTF · Exploração web · Pentest',
    },
    spoken: {
      label: 'Idiomas',
      value: 'Português (nativo) · Inglês (avançado)',
    },
  },
  contact: {
    emailLabel: 'Email',
    linkedinLabel: 'LinkedIn',
    githubLabel: 'GitHub',
    locationLabel: 'Localização',
    locationValue: 'São Paulo, Brasil',
    footer: 'feito com Astro + Three.js',
  },
  notFound: {
    code: '404',
    heading: 'Página não encontrada',
    body: 'A página que você está procurando não existe ou foi movida.',
    backHome: 'Voltar ao início',
    backHomeAria: 'Voltar para a página inicial',
  },
};
