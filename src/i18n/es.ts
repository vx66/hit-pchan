export const es = {
  startTitle: '¡Golpea a P-Chan, se lo merece!', start: 'Click para empezar', title: '¡Golpea a P-Chan!',
  hammer: '¡Has adquirido el martillo! ¡Ya puedes golpear a P-Chan con él!', knife: '¡Has adquirido el cuchillo! ¡Ya puedes acuchillar a P-Chan con él!', continue: 'Continuar',
  ending: '¿Estás feliz? Me has matado. Tus golpes me hicieron mucho daño, y tus emociones también. Ya no podré salvarte de ti misma, {name}.',
  hitCount: 'Has golpeado {count} veces a P-Chan', stabCount: 'Has acuchillado {count} veces a P-Chan',
  nameLabel: 'Tu nombre', namePlaceholder: 'Escribe tu nombre', replay: 'Jugar nuevamente',
  createdBy: 'Creado por',
  language: 'Idioma', hit: 'Golpear a P-Chan', loading: 'Cargando…', error: 'No se pudieron cargar los sprites. Recarga la página.', acquired: '¡Nuevo objeto!',
};
export type Translation = { [K in keyof typeof es]: string };
