# mywispy.com — Portfolio de Luis Pazzanese

## O que é este projeto

Site portfolio pessoal de Luis Fernando Pazzanese Pinheiro, estudante de Engenharia da Computação no Insper. O site será hosteado em mywispy.com via Cloudflare Pages.

## Stack

- **Framework:** Astro
- **Visual:** Three.js no hero (elemento 3D sutil, tipo PCB ou circuito)
- **Estilo:** Dark theme, minimalista e técnico
- **Fontes:** Monospace nos títulos/destaques (JetBrains Mono ou similar), sans-serif clean no corpo (Inter ou similar)
- **Deploy:** Cloudflare Pages
- **Futuro:** Mini CTF challenge em WebAssembly (NÃO implementar agora, apenas deixar a estrutura pronta)

## Design

- Dark theme (#0a0a0a fundo, tons de cinza, accent color sutil)
- Bastante whitespace
- Animações sutis no scroll (fade-in, não exagerar)
- Responsivo (mobile-first)
- Sem frameworks CSS pesados — CSS vanilla ou Tailwind se necessário
- NÃO usar estética genérica de template. Tem que parecer feito por engenheiro, não por designer.

## Estrutura do site (single page com seções)

### 1. Hero
- Nome: Luis Fernando Pazzanese Pinheiro
- Título: Computer Engineer
- Subtítulo: Embedded Systems · Cybersecurity · Low-level Programming
- Links: GitHub (https://github.com/LuisPazzanese), LinkedIn (https://www.linkedin.com/in/luis-pazzanese/), Email (luis@mywispy.com)
- Elemento Three.js no background (PCB trace, circuito, ou partículas técnicas — algo sutil)

### 2. About
Computer Engineering student at Insper (5th semester, graduating 2028). Focused on embedded systems, cybersecurity, and low-level programming. Experienced in building real-time systems with FreeRTOS on ARM microcontrollers and developing automation tools for the financial industry. Rank 2 in Insper's cybersecurity club (Insper SEC) CTF competitions.

International background: MIT NuVu Program (USA), CATS College Cambridge (UK), ELS Language Centers (Canada).

### 3. Experience

**Intern — Zagros Capital Asset Management** (Mar 2025 - Sep 2025)
Zagros Capital is an independent real estate asset manager with R$2B+ AUM, based in São Paulo.
- Built an automated reporting dashboard using Python and Streamlit for internal fund metrics
- Developed Python automation scripts to streamline back office Excel workflows
- Structured and processed financial market datasets
- Supported portfolio management and internal analysis workflows

### 4. Education

**BSc in Computer Engineering — Insper** (2023 - 2028, 5th semester)
Relevant coursework: Embedded Systems, Computer Architecture, Data Science, Software Design, Agile Development, Calculus I-III, Physics I-III

**International Education:**
- MIT NuVu Program — USA
- CATS College Cambridge — UK (1 semester of high school)
- ELS Language Centers — Canada

**Pre-university:** ITA-track prep course (1 year) — competitive engineering entrance preparation

### 5. Projects

#### Embedded Systems (Raspberry Pi Pico 2 / RP2350)

| Projeto | Repo | Descrição | Stack |
|---------|------|-----------|-------|
| Air Mouse | pico-mpu-rtos | MPU6050 sensor fusion + AHRS + FreeRTOS (4 tasks/3 queues/1 semaphore) + Python host bridge | C · FreeRTOS · I2C |
| Touchscreen Stepper Controller | pico-expert | ILI9341 touchscreen with custom GFX driver controlling a unipolar stepper motor with animated UI | C · SPI · GPIO |
| RTOS Multi-task System | pico-rtos-oled | FreeRTOS scaffold: 4 tasks synchronized via binary-semaphore ring on RP2350 | C · FreeRTOS · OLED |
| ADC Pipeline | pico-adc-pwm | FreeRTOS ADC-to-UART pipeline with auto-grading rubric | C · FreeRTOS · ADC |
| Ultrasonic Ranger | pico-timer | Non-blocking HC-SR04 ultrasonic ranging using SDK alarms + GPIO IRQs with serial CLI | C · HC-SR04 |
| IRQ Buzzer | pico-irq | IRQ-driven 2-button buzzer tone generator with software debounce | C · GPIO · IRQ |

#### Other Projects

| Projeto | Repo | Descrição | Stack |
|---------|------|-----------|-------|
| Ninja Card Game | pygame-ninja | State-machine card-matching reflex game | Python · Pygame |
| Retro Gaming Console | — | Batocera emulation setup on Raspberry Pi 5 | Linux · Batocera |

Todos os repos em: https://github.com/LuisPazzanese

### 6. CTF Writeups

Seção para writeups de CTF. Luís é rank 2 na Insper SEC (entidade de cybersecurity do Insper).
- Tem 6-7 CTFs para documentar (maioria web: SQLi, XSS, SSRF, etc.)
- Por enquanto, criar a seção com placeholder: "Writeups coming soon" com a info de rank
- A estrutura deve permitir adicionar writeups facilmente depois (cada writeup como um card ou post)

### 7. Skills

```
Languages:     Python · C · x86 Assembly · JavaScript
Embedded:      Raspberry Pi Pico 2 (RP2350) · FreeRTOS · bare-metal ARM
Protocols:     I2C · SPI · UART · GPIO · ADC · PWM
Web:           React · HTML · CSS
Tools:         GDB · Git · Linux · Wireshark · VirtualBox · Streamlit
Security:      CTF competitions · Web exploitation · Penetration testing
Languages:     Portuguese (native) · English (advanced)
```

### 8. Contact
- Email: luis@mywispy.com
- LinkedIn: https://www.linkedin.com/in/luis-pazzanese/
- GitHub: https://github.com/LuisPazzanese
- Location: São Paulo, Brazil

## Regras para o Claude Code

1. **NÃO saia do escopo.** Este é um projeto de portfolio site. Não mude a stack, não adicione features não listadas, não refatore sem pedir.
2. **Código limpo e comentado.** Cada componente/seção deve ser fácil de entender e modificar depois.
3. **Conteúdo real apenas.** NÃO invente projetos, experiências ou habilidades. Use SOMENTE o que está documentado aqui.
4. **Performance primeiro.** O site deve carregar rápido. Three.js só no hero, lazy load nas outras seções.
5. **SEO básico.** Meta tags, Open Graph, título e descrição corretos.
6. **Mobile-first.** Responsivo em todas as seções.
7. **Acessibilidade.** Semantic HTML, alt texts, contraste adequado.
8. **Commits claros.** Um commit por seção/feature implementada.
9. **Não implementar o CTF em WASM agora.** Só a estrutura da seção de writeups.
10. **Economize tokens.** Não reescreva arquivos inteiros para mudanças pequenas. Use edições cirúrgicas.
