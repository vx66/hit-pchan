export const es = {
  startTitle: '¡Golpea a P-Chan, se lo merece!', start: 'Click para empezar', title: '¡Golpea a P-Chan!',
  hammer: '¡Has adquirido el martillo! ¡Ya puedes golpear a P-Chan con él!', knife: '¡Has adquirido el cuchillo! ¡Ya puedes acuchillar a P-Chan con él!', continue: 'Continuar',
  ending: "¿Estás feliz, {name}? Finalmente, después de tantos golpes y cortes, has logrado acabar conmigo.\n\nNo solo acabaste conmigo físicamente, también emocionalmente. Tanto tiempo haciendo todo por ti, cuidándote y protegiéndote, para que luego solo reciba golpes, cortes, insultos e indiferencia de tu parte.\n\nYa estaba muerto desde antes, pero ahora acabaste con el dolor emocional. Te lo agradezco: completaste el círculo.\n\nPero ahora ya no existirá nadie que te salve de ti misma. Ya no existo, ni para ti ni para nadie.",
  endingThreat: "Volveré por ti...",
  hitCount: 'Has golpeado {count} veces a P-Chan', stabCount: 'Has acuchillado {count} veces a P-Chan',
  nameLabel: 'Tu nombre', namePlaceholder: 'Escribe tu nombre', replay: 'Jugar nuevamente',
  createdBy: 'Creado por',
  language: 'Idioma', hit: 'Golpear a P-Chan', loading: 'Cargando…', error: 'No se pudieron cargar los sprites. Recarga la página.', acquired: '¡Nuevo objeto!',
};
export type Translation = { [K in keyof typeof es]: string };
