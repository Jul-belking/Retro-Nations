// Pantalla de Inicio: presentación de la tienda + carrusel de momentos
// memorables del fútbol, cada uno con su historia corta.

import { useCallback, useEffect, useState } from 'react';
import { MOMENTS, MOMENTS_CREDIT } from '../lib/moments';
import { Button } from '../components/ui';

interface InicioProps {
  onGoPais: () => void;
}

export function Inicio({ onGoPais }: InicioProps) {
  const [index, setIndex] = useState(0);
  const count = MOMENTS.length;

  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  // Avance automático cada 6 s; se reinicia al interactuar.
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count, index]);

  return (
    <main style={{ flex: 1 }}>
      {/* Hero */}
      <section style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
        <img
          src="/images/hero-stadium.jpg"
          alt="Estadio de fútbol lleno antes del partido"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(48,46,43,.2), rgba(48,46,43,.8))',
          }}
        />
        <div style={{ position: 'absolute', left: 0, bottom: 0, padding: '40px 32px', maxWidth: 680 }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-widest)',
              fontSize: 13,
              color: 'var(--gold-400)',
              margin: '0 0 8px',
            }}
          >
            Camisetas retro de selecciones · 80s, 90s y 00s
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--cream-50)',
              fontSize: 46,
              lineHeight: 'var(--leading-tight)',
              margin: '0 0 12px',
              textTransform: 'uppercase',
              fontWeight: 400,
            }}
          >
            Camisetas que ya no se consiguen
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--cream-100)',
              fontSize: 17,
              lineHeight: 'var(--leading-relaxed)',
              margin: '0 0 20px',
            }}
          >
            Reproducciones de las equipaciones clásicas de las grandes selecciones. Cada prenda es verificada
            a mano antes de publicarse: sin dropshipping, sin sorpresas de talla.
          </p>
          <Button variant="primary" size="lg" onClick={onGoPais}>
            Explorar por país
          </Button>
        </div>
      </section>

      {/* Descripción */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 24px 8px' }}>
        <div style={{ maxWidth: 720 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              fontSize: 28,
              margin: '0 0 12px',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
            }}
          >
            Coleccionamos historia, no solo ropa
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            En Retro Nations creemos que una camiseta guarda un momento. Estos son algunos de los instantes
            que marcaron al fútbol para siempre — la misma emoción que buscas cuando vuelves a vestir los
            colores de tu selección.
          </p>
        </div>
      </section>

      {/* Carrusel de momentos */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 24px 24px' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '2px solid var(--color-border)',
            background: 'var(--ink-900)',
            aspectRatio: '16 / 7',
            minHeight: 320,
          }}
        >
          {MOMENTS.map((m, i) => (
            <div
              key={m.id}
              aria-hidden={i !== index}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: i === index ? 1 : 0,
                transition: 'opacity 500ms var(--ease-standard)',
                pointerEvents: i === index ? 'auto' : 'none',
              }}
            >
              <img
                src={m.img}
                alt={`${m.title} — ${m.meta}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(48,46,43,.05) 30%, rgba(48,46,43,.88) 100%)',
                }}
              />
              <div style={{ position: 'absolute', left: 0, bottom: 0, padding: '28px 32px', maxWidth: 640 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-widest)',
                    fontSize: 12,
                    color: 'var(--gold-400)',
                    margin: '0 0 6px',
                  }}
                >
                  {m.meta}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    fontSize: 32,
                    lineHeight: 'var(--leading-tight)',
                    color: 'var(--cream-50)',
                    margin: '0 0 8px',
                    fontWeight: 400,
                  }}
                >
                  {m.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 15,
                    lineHeight: 'var(--leading-normal)',
                    color: 'var(--cream-100)',
                    margin: 0,
                  }}
                >
                  {m.text}
                </p>
              </div>
            </div>
          ))}

          {/* Controles */}
          <button
            aria-label="Anterior"
            className="rn-carousel-arrow"
            style={{ left: 16 }}
            onClick={() => go(index - 1)}
          >
            ‹
          </button>
          <button
            aria-label="Siguiente"
            className="rn-carousel-arrow"
            style={{ right: 16 }}
            onClick={() => go(index + 1)}
          >
            ›
          </button>

          {/* Puntos */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              right: 24,
              display: 'flex',
              gap: 8,
            }}
          >
            {MOMENTS.map((m, i) => (
              <button
                key={m.id}
                aria-label={`Ir al momento ${i + 1}`}
                onClick={() => go(i)}
                style={{
                  width: i === index ? 26 : 10,
                  height: 10,
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  background: i === index ? 'var(--gold-500)' : 'rgba(250,247,241,.55)',
                  transition: 'width 200ms var(--ease-standard), background 200ms var(--ease-standard)',
                }}
              />
            ))}
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)', margin: '12px 2px 0' }}>
          {MOMENTS_CREDIT}
        </p>
      </section>

      {/* CTA final */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px 80px', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            fontSize: 24,
            margin: '0 0 16px',
            color: 'var(--color-text-primary)',
            fontWeight: 400,
          }}
        >
          Encuentra la camiseta de tu selección
        </h2>
        <Button variant="primary" size="lg" onClick={onGoPais}>
          Ver catálogo por país
        </Button>
      </section>
    </main>
  );
}
