// Project data. Descriptions live in src/data/i18n/{en,pt}.ts under
// `projects.descriptions[<descriptionKey>]` so they can be translated; this
// file only holds structure (name, repo, stack).

import type { Translations } from './i18n/types';

type DescriptionKey = keyof Translations['projects']['descriptions'];

export interface Project {
  name: string;
  repo: string | null; // GitHub repo name under LuisPazzanese, or null for no public repo
  descriptionKey: DescriptionKey;
  stack: string[];
}

export const embeddedProjects: Project[] = [
  {
    name: 'Air Mouse',
    repo: 'pico-mpu-rtos',
    descriptionKey: 'airMouse',
    stack: ['C', 'FreeRTOS', 'I2C'],
  },
  {
    name: 'Touchscreen Stepper Controller',
    repo: 'pico-expert',
    descriptionKey: 'stepper',
    stack: ['C', 'SPI', 'GPIO'],
  },
  {
    name: 'RTOS Multi-task System',
    repo: 'pico-rtos-oled',
    descriptionKey: 'rtos',
    stack: ['C', 'FreeRTOS', 'OLED'],
  },
  {
    name: 'ADC Pipeline',
    repo: 'pico-adc-pwm',
    descriptionKey: 'adc',
    stack: ['C', 'FreeRTOS', 'ADC'],
  },
  {
    name: 'Ultrasonic Ranger',
    repo: 'pico-timer',
    descriptionKey: 'ultrasonic',
    stack: ['C', 'HC-SR04'],
  },
  {
    name: 'IRQ Buzzer',
    repo: 'pico-irq',
    descriptionKey: 'buzzer',
    stack: ['C', 'GPIO', 'IRQ'],
  },
];

export const otherProjects: Project[] = [
  {
    name: 'Ninja Card Game',
    repo: 'pygame-ninja',
    descriptionKey: 'ninja',
    stack: ['Python', 'Pygame'],
  },
  {
    name: 'Retro Gaming Console',
    repo: null,
    descriptionKey: 'retro',
    stack: ['Linux', 'Batocera'],
  },
];

export const repoBase = 'https://github.com/LuisPazzanese';
