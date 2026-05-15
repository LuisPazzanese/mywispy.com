/*
 * Madgwick AHRS — orientation filter from gyroscope + accelerometer.
 *
 * Reference: S. Madgwick, "An efficient orientation filter for inertial
 * and inertial/magnetic sensor arrays", 2010.
 *
 * Adapted (heavily trimmed) from the same algorithm used in pico-mpu-rtos:
 *   https://github.com/LuisPazzanese/pico-mpu-rtos
 * That repo runs this on an RP2350 with a real MPU6050. Here it runs in the
 * browser, fed by phone DeviceMotion samples (mobile) or synthetic input
 * (desktop drag).
 *
 * Build (no libc, no entry point — pure exported functions):
 *   clang --target=wasm32 -O2 -nostdlib -Wl,--no-entry -Wl,--export-all \
 *         -Wl,--allow-undefined wasm/ahrs.c -o public/ahrs.wasm
 *
 * Exports:
 *   madgwick_init(beta)           — set filter gain (typ 0.04 — 0.1)
 *   madgwick_update(gx,gy,gz,ax,ay,az,dt) — one fusion step
 *   q0(),q1(),q2(),q3()           — read back the quaternion
 */

/* --- minimal math (no libm in -nostdlib) -------------------------------- */

/* Fast inverse square root. Quake III trick; gives ~1.5% error, plenty for
   orientation tracking and avoids needing libm/sqrtf in our nostdlib build. */
static float inv_sqrt(float x) {
  union { float f; unsigned int i; } u = { x };
  u.i = 0x5f3759df - (u.i >> 1);
  float y = u.f;
  y = y * (1.5f - 0.5f * x * y * y); /* one Newton iteration */
  return y;
}

/* --- filter state ------------------------------------------------------- */

static float q_0 = 1.0f, q_1 = 0.0f, q_2 = 0.0f, q_3 = 0.0f;
static float beta = 0.06f;

/* --- exports ------------------------------------------------------------ */

__attribute__((visibility("default"))) void madgwick_init(float new_beta) {
  q_0 = 1.0f;
  q_1 = 0.0f;
  q_2 = 0.0f;
  q_3 = 0.0f;
  beta = new_beta;
}

/* gx,gy,gz in rad/s; ax,ay,az in any consistent unit (gets normalised); dt in s. */
__attribute__((visibility("default"))) void madgwick_update(
    float gx, float gy, float gz,
    float ax, float ay, float az,
    float dt) {
  /* Rate of change of quaternion from gyroscope */
  float qDot1 = 0.5f * (-q_1 * gx - q_2 * gy - q_3 * gz);
  float qDot2 = 0.5f * (q_0 * gx + q_2 * gz - q_3 * gy);
  float qDot3 = 0.5f * (q_0 * gy - q_1 * gz + q_3 * gx);
  float qDot4 = 0.5f * (q_0 * gz + q_1 * gy - q_2 * gx);

  /* If the accelerometer reading is non-zero, fuse it in via gradient descent. */
  if (!((ax == 0.0f) && (ay == 0.0f) && (az == 0.0f))) {
    /* Normalise accelerometer measurement */
    float recipNorm = inv_sqrt(ax * ax + ay * ay + az * az);
    ax *= recipNorm;
    ay *= recipNorm;
    az *= recipNorm;

    /* Auxiliary variables to avoid repeated arithmetic */
    float _2q0 = 2.0f * q_0;
    float _2q1 = 2.0f * q_1;
    float _2q2 = 2.0f * q_2;
    float _2q3 = 2.0f * q_3;
    float _4q0 = 4.0f * q_0;
    float _4q1 = 4.0f * q_1;
    float _4q2 = 4.0f * q_2;
    float _8q1 = 8.0f * q_1;
    float _8q2 = 8.0f * q_2;
    float q0q0 = q_0 * q_0;
    float q1q1 = q_1 * q_1;
    float q2q2 = q_2 * q_2;
    float q3q3 = q_3 * q_3;

    /* Gradient descent algorithm corrective step */
    float s0 = _4q0 * q2q2 + _2q2 * ax + _4q0 * q1q1 - _2q1 * ay;
    float s1 = _4q1 * q3q3 - _2q3 * ax + 4.0f * q0q0 * q_1 - _2q0 * ay - _4q1 +
               _8q1 * q1q1 + _8q1 * q2q2 + _4q1 * az;
    float s2 = 4.0f * q0q0 * q_2 + _2q0 * ax + _4q2 * q3q3 - _2q3 * ay - _4q2 +
               _8q2 * q1q1 + _8q2 * q2q2 + _4q2 * az;
    float s3 = 4.0f * q1q1 * q_3 - _2q1 * ax + 4.0f * q2q2 * q_3 - _2q2 * ay;
    recipNorm = inv_sqrt(s0 * s0 + s1 * s1 + s2 * s2 + s3 * s3);
    s0 *= recipNorm;
    s1 *= recipNorm;
    s2 *= recipNorm;
    s3 *= recipNorm;

    /* Apply feedback */
    qDot1 -= beta * s0;
    qDot2 -= beta * s1;
    qDot3 -= beta * s2;
    qDot4 -= beta * s3;
  }

  /* Integrate to yield new quaternion */
  q_0 += qDot1 * dt;
  q_1 += qDot2 * dt;
  q_2 += qDot3 * dt;
  q_3 += qDot4 * dt;

  /* Normalise quaternion */
  float recipNorm = inv_sqrt(q_0 * q_0 + q_1 * q_1 + q_2 * q_2 + q_3 * q_3);
  q_0 *= recipNorm;
  q_1 *= recipNorm;
  q_2 *= recipNorm;
  q_3 *= recipNorm;
}

__attribute__((visibility("default"))) float q0(void) { return q_0; }
__attribute__((visibility("default"))) float q1(void) { return q_1; }
__attribute__((visibility("default"))) float q2(void) { return q_2; }
__attribute__((visibility("default"))) float q3(void) { return q_3; }
