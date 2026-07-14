// Pestaña País — nivel 1: lista de continentes. Al elegir uno se abre el
// listado de selecciones de ese continente (orden alfabético). Los
// continentes sin selecciones aún se muestran como "Próximamente".

import { CONTINENTS, teamsByContinent } from '../lib/catalog';
import { Badge } from '../components/ui';

interface ContinentsProps {
  onSelectContinent: (continentId: string) => void;
}

export function Continents({ onSelectContinent }: ContinentsProps) {
  return (
    <main style={{ flex: 1, maxWidth: 1240, margin: '0 auto', padding: '48px 24px 80px', width: '100%', boxSizing: 'border-box' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase',
          fontSize: 30,
          margin: '0 0 8px',
          color: 'var(--color-text-primary)',
          fontWeight: 400,
        }}
      >
        Elige un continente
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', margin: '0 0 32px' }}>
        Navega las selecciones por región y encuentra tu equipación.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {CONTINENTS.map((continent) => {
          const teams = teamsByContinent(continent.id);
          const available = teams.length > 0;
          return (
            <div
              key={continent.id}
              className={available ? 'rn-hover-card' : undefined}
              style={{
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '22px 22px 20px',
                cursor: available ? 'pointer' : 'default',
                opacity: available ? 1 : 0.62,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 150,
              }}
              onClick={() => available && onSelectContinent(continent.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    fontSize: 22,
                    margin: 0,
                    color: 'var(--color-text-primary)',
                    fontWeight: 400,
                  }}
                >
                  {continent.name}
                </h2>
                {available ? (
                  <Badge variant="primary">{teams.length}</Badge>
                ) : (
                  <Badge variant="neutral">Próximamente</Badge>
                )}
              </div>

              {available ? (
                <>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 'var(--leading-normal)' }}>
                    {teams.map((t) => t.name).join(' · ')}
                  </p>
                  <span
                    style={{
                      marginTop: 'auto',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 'var(--tracking-wide)',
                      color: 'var(--color-link)',
                    }}
                  >
                    Ver selecciones →
                  </span>
                </>
              ) : (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>
                  Aún no tenemos selecciones de esta región. Estamos ampliando el catálogo.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
