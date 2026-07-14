// Momentos memorables del fútbol para el carrusel de Inicio.
//
// Curaduría de momentos inspirada en un reportaje del Diario AS. Las
// imágenes NO son de AS: son de dominio público / licencia libre
// (Wikimedia Commons), para poder publicarlas sin infringir derechos.

export interface Moment {
  id: string;
  img: string;
  title: string;
  meta: string; // selección · año · torneo
  text: string;
}

export const MOMENTS: Moment[] = [
  {
    id: 'pele-1958',
    img: '/images/moments/pele-1958.jpg',
    title: 'Nace una leyenda',
    meta: 'Brasil · Suecia 1958',
    text: 'Con solo 17 años, Pelé irrumpe en el Mundial de Suecia, marca en la final y conquista la primera Copa del Mundo de Brasil. El fútbol nunca volvió a ser el mismo.',
  },
  {
    id: 'inglaterra-1966',
    img: '/images/moments/inglaterra-1966.jpg',
    title: 'El único de Inglaterra',
    meta: 'Inglaterra · 1966',
    text: 'Capitaneada por Bobby Moore, Inglaterra sale al césped de Wembley para la final que le daría su primer y hasta hoy único título mundial, en casa.',
  },
  {
    id: 'cruyff-1974',
    img: '/images/moments/cruyff-1974.jpg',
    title: 'La Naranja Mecánica',
    meta: 'Países Bajos · 1974',
    text: 'Johan Cruyff y el "fútbol total" deslumbran al mundo con una idea que cambió el juego para siempre, aunque la Copa se les escapara en la final.',
  },
  {
    id: 'alemania-1974',
    img: '/images/moments/alemania-1974.jpg',
    title: 'Der Bomber',
    meta: 'Alemania · años 70',
    text: 'Gerd Müller, el goleador más letal de su generación, fue el símbolo de una Alemania implacable que levantó la Copa del Mundo en 1974.',
  },
  {
    id: 'maradona-1986',
    img: '/images/moments/maradona-1986.jpg',
    title: 'El gol del siglo',
    meta: 'Argentina · México 1986',
    text: 'Diego Maradona firma ante Inglaterra la jugada más recordada de todos los Mundiales y arrastra él solo a Argentina hacia la gloria.',
  },
];

// Nota de crédito que acompaña al carrusel.
export const MOMENTS_CREDIT =
  'Selección de momentos inspirada en un reportaje del Diario AS. Imágenes de dominio público y licencia libre (Wikimedia Commons).';
