// Project data, sourced from CLAUDE.md.
// Kept in one place so the section is trivial to extend later.

export interface Project {
  name: string;
  repo: string | null; // GitHub repo name under LuisPazzanese, or null for no public repo
  description: string;
  stack: string[];
}

export const embeddedProjects: Project[] = [
  {
    name: 'Air Mouse',
    repo: 'pico-mpu-rtos',
    description:
      'MPU6050 sensor fusion + AHRS + FreeRTOS (4 tasks / 3 queues / 1 semaphore) with a Python host bridge.',
    stack: ['C', 'FreeRTOS', 'I2C'],
  },
  {
    name: 'Touchscreen Stepper Controller',
    repo: 'pico-expert',
    description:
      'ILI9341 touchscreen with custom GFX driver controlling a unipolar stepper motor and an animated UI.',
    stack: ['C', 'SPI', 'GPIO'],
  },
  {
    name: 'RTOS Multi-task System',
    repo: 'pico-rtos-oled',
    description:
      'FreeRTOS scaffold: 4 tasks synchronized via a binary-semaphore ring on RP2350.',
    stack: ['C', 'FreeRTOS', 'OLED'],
  },
  {
    name: 'ADC Pipeline',
    repo: 'pico-adc-pwm',
    description: 'FreeRTOS ADC-to-UART pipeline with an auto-grading rubric.',
    stack: ['C', 'FreeRTOS', 'ADC'],
  },
  {
    name: 'Ultrasonic Ranger',
    repo: 'pico-timer',
    description:
      'Non-blocking HC-SR04 ultrasonic ranging using SDK alarms and GPIO IRQs with a serial CLI.',
    stack: ['C', 'HC-SR04'],
  },
  {
    name: 'IRQ Buzzer',
    repo: 'pico-irq',
    description: 'IRQ-driven 2-button buzzer tone generator with software debounce.',
    stack: ['C', 'GPIO', 'IRQ'],
  },
];

export const otherProjects: Project[] = [
  {
    name: 'Ninja Card Game',
    repo: 'pygame-ninja',
    description: 'State-machine card-matching reflex game.',
    stack: ['Python', 'Pygame'],
  },
  {
    name: 'Retro Gaming Console',
    repo: null,
    description: 'Batocera emulation setup on Raspberry Pi 5.',
    stack: ['Linux', 'Batocera'],
  },
];

export const repoBase = 'https://github.com/LuisPazzanese';
