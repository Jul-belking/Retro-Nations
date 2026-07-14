// Listado de selecciones de un continente (pestaña País — nivel 2).
// Dos layouts: 'list' (por defecto, filas expandibles con las dos
// equipaciones) y 'grid' (tarjetas). Se cambia con ?layout=grid.

import { useState } from 'react';
import { KITS, SIZES, variantKey, type KitId, type Team } from '../lib/catalog';
import { Badge, Tag } from '../components/ui';
import { Jersey } from '../components/Jersey';
import { flagBackground } from '../lib/nations';

interface CatalogProps {
  teams: Team[];
  continentName: string;
  stock: Record<string, number>;
  layout: 'list' | 'grid';
  onOpenDetail: (teamId: string, kit?: KitId) => void;
  onBack: () => void;
}

function teamTotalStock(stock: Record<string, number>, team: Team): number {
  return KITS.reduce(
    (sum, k) => sum + SIZES.reduce((a, sz) => a + (stock[variantKey(team.id, k.id, sz)] ?? 0), 0),
    0,
  );
}

function kitStockFor(stock: Record<string, number>, team: Team, kit: KitId): number {
  return SIZES.reduce((a, sz) => a + (stock[variantKey(team.id, kit, sz)] ?? 0), 0);
}

function StockBadge({ total }: { total: number }) {
  if (total === 0) return <Badge variant="error">Agotado</Badge>;
  if (total <= 4) return <Badge variant="warning">Pocas unidades</Badge>;
  return null;
}

export function Catalog({ teams, continentName, stock, layout, onOpenDetail, onBack }: CatalogProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  return (
    <main style={{ flex: 1 }}>
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 24px 80px' }}>
        <p
          style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-link)', cursor: 'pointer', margin: '0 0 20px' }}
          onClick={onBack}
        >
          ← Volver a continentes
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              fontSize: 28,
              margin: 0,
              color: 'var(--color-text-primary)',
              fontWeight: 400,
            }}
          >
            {continentName}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            {teams.length} {teams.length === 1 ? 'selección' : 'selecciones'} · orden alfabético
          </p>
        </div>

        {layout === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 24 }}>
            {teams.map((team) => {
              const total = teamTotalStock(stock, team);
              return (
                <div
                  key={team.id}
                  className="rn-hover-card"
                  style={{
                    background: 'var(--color-surface)',
                    border: '2px solid var(--color-border)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => onOpenDetail(team.id)}
                >
                  <div style={{ position: 'relative', aspectRatio: '4 / 3', background: 'var(--color-surface-sunken)' }}>
                    <Jersey teamId={team.id} kit="local" style={{ width: '100%', height: '100%' }} />
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                      <Tag>{team.era}</Tag>
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      <StockBadge total={total} />
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px 16px', background: flagBackground(team.id, 'var(--color-surface)', 0.2) }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-heading)',
                        textTransform: 'uppercase',
                        fontSize: 12,
                        letterSpacing: 'var(--tracking-wide)',
                        color: 'var(--color-text-muted)',
                        margin: '0 0 4px',
                      }}
                    >
                      Selección nacional
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 18,
                        margin: '0 0 6px',
                        color: 'var(--color-text-primary)',
                        textTransform: 'uppercase',
                        fontWeight: 400,
                      }}
                    >
                      {team.name}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        margin: 0,
                      }}
                    >
                      Desde ${team.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid var(--color-border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {teams.map((team) => {
              const total = teamTotalStock(stock, team);
              const expanded = expandedTeam === team.id;
              return (
                <div key={team.id} style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      background: flagBackground(
                        team.id,
                        expanded ? 'var(--color-surface-sunken)' : 'var(--color-surface)',
                        expanded ? 0.28 : 0.22,
                      ),
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                    onClick={() => setExpandedTeam(expanded ? null : team.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 20,
                          margin: 0,
                          color: 'var(--color-text-primary)',
                          textTransform: 'uppercase',
                          fontWeight: 400,
                        }}
                      >
                        {team.name}
                      </p>
                      <Tag>{team.era}</Tag>
                      <StockBadge total={total} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 15,
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                        }}
                      >
                        Desde ${team.price}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 18,
                          color: 'var(--color-text-muted)',
                          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          display: 'inline-block',
                          transition: 'transform 140ms ease',
                        }}
                      >
                        ⌄
                      </span>
                    </div>
                  </div>
                  {expanded && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 16,
                        padding: 20,
                        background: flagBackground(team.id, 'var(--color-surface-sunken)', 0.16),
                      }}
                    >
                      {KITS.map((kit) => {
                        const kitStock = kitStockFor(stock, team, kit.id);
                        return (
                          <div
                            key={kit.id}
                            className="rn-hover-card"
                            style={{
                              background: 'var(--color-surface)',
                              border: '2px solid var(--color-border)',
                              borderRadius: 8,
                              overflow: 'hidden',
                              cursor: 'pointer',
                            }}
                            onClick={() => onOpenDetail(team.id, kit.id)}
                          >
                            <div style={{ position: 'relative', aspectRatio: '4 / 3', background: 'var(--color-surface-sunken)' }}>
                              <Jersey teamId={team.id} kit={kit.id} style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div style={{ padding: '12px 14px 14px' }}>
                              <p
                                style={{
                                  fontFamily: 'var(--font-heading)',
                                  textTransform: 'uppercase',
                                  fontSize: 12,
                                  letterSpacing: 'var(--tracking-wide)',
                                  color: 'var(--color-text-muted)',
                                  margin: '0 0 4px',
                                }}
                              >
                                {kit.label}
                              </p>
                              <p
                                style={{
                                  fontFamily: 'var(--font-body)',
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: 'var(--color-primary)',
                                  margin: 0,
                                }}
                              >
                                ${team.price} · {kitStock === 0 ? 'Agotado' : `${kitStock} disponibles`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
