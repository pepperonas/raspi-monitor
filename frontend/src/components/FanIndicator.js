import React, { useEffect, useRef } from 'react';

// Fan-Rotor, der sich mit der ECHTEN Drehzahl dreht (2026-08-07).
//
// Kein CSS-Loop mit fester Dauer: ein rAF integriert den Winkel mit einer
// Winkelgeschwindigkeit, die per Feder auf das rpm-Ziel einschwingt — der
// Rotor beschleunigt und laeuft aus wie ein echter Luefter, statt beim
// naechsten Poll hart die Geschwindigkeit zu wechseln. Sichtbare Drehrate ist
// perzeptuell skaliert (2900 rpm ≈ 4,8 U/s — lebendig, aber verfolgbar; die
// wahre Rate von ~48 U/s waere nur Flimmern). Der Ring zeigt die
// PWM-Auslastung als Bogen, der Glow zieht mit ihr. prefers-reduced-motion:
// Rotor steht, Zahlen und Ring tragen die Information allein.
const FanIndicator = ({ rpm = 0, pwm = null, size = 44, color = '#7ddfa6' }) => {
  const rotorRef = useRef(null);
  const state = useRef({ angle: 0, vel: 0, target: 0, raf: 0, last: 0 });

  const r = Math.max(0, Number(rpm) || 0);
  state.current.target = Math.min(8, r / 600) * 360; // Grad/s, gedeckelt

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const st = state.current;
    const step = (t) => {
      const dt = Math.min(0.1, (t - st.last) / 1000 || 0.016);
      st.last = t;
      // Feder auf die Zielgeschwindigkeit: Anlauf ~0,6 s, Auslauf traeger —
      // ein Luefter faellt langsamer, als er hochdreht.
      const k = st.target > st.vel ? 3.0 : 1.2;
      st.vel += (st.target - st.vel) * Math.min(1, dt * k);
      st.angle = (st.angle + st.vel * dt) % 360;
      if (rotorRef.current) {
        rotorRef.current.style.transform = `rotate(${st.angle.toFixed(2)}deg)`;
      }
      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(st.raf);
  }, []);

  const pwmFrac = pwm != null ? Math.max(0, Math.min(1, pwm / 255)) : null;
  const C = 2 * Math.PI * 19; // Ringumfang (r=19)
  const glow = pwmFrac != null ? 2 + pwmFrac * 6 : 3;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      role="img"
      aria-label={r > 0 ? `Luefter ${r} rpm` : 'Luefter steht'}
      style={{ overflow: 'visible', flex: '0 0 auto' }}
    >
      {/* PWM-Ring: Track + Auslastungsbogen (beginnt oben) */}
      <circle cx="22" cy="22" r="19" fill="none" stroke="currentColor" opacity="0.15" strokeWidth="2.5" style={{ color }} />
      {pwmFrac != null && (
        <circle
          cx="22" cy="22" r="19" fill="none" strokeWidth="2.5" strokeLinecap="round"
          stroke={color}
          strokeDasharray={`${(pwmFrac * C).toFixed(1)} ${C.toFixed(1)}`}
          transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dasharray .6s cubic-bezier(.2,0,0,1)', filter: `drop-shadow(0 0 ${glow}px ${color})` }}
        />
      )}
      {/* Rotor: 5 gebogene Blaetter + Nabe; rotiert per rAF um die Mitte */}
      <g ref={rotorRef} style={{ transformOrigin: '22px 22px', willChange: 'transform' }}>
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={a}
            d="M22 22 C 18 14, 20 7.5, 24.5 7 C 28 6.6, 29 11, 26.5 14.5 C 25 16.8, 23.5 19.5, 22 22 Z"
            fill={color}
            opacity={r > 0 ? 0.85 : 0.35}
            transform={`rotate(${a} 22 22)`}
          />
        ))}
        <circle cx="22" cy="22" r="4.2" fill={color} opacity={r > 0 ? 1 : 0.5} />
        <circle cx="22" cy="22" r="1.6" fill="#0d0e12" />
      </g>
    </svg>
  );
};

export default FanIndicator;
