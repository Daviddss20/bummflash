/*
 * Reglas:
 * El final de cada nivel debe ser el inicio del siguiente
*/

export const emojis = {
  '-': ' ',
  'O': '🛖',
  'X': '🔥',
  'I': '🍦',
  'T': '⏱️',
  'PLAYER': '☃️'
}

export const maps = {}

maps['Classic'] = {
  levels: [
  `
  IXXXXXXXXX
  -XXXXXXXXX
  -XX-XXX-XX
  -XX-XXX-XX
  -XXXXXXXXX
  -XXXXXXXXX
  -X-XXXXX-X
  -XX-----XX
  -XXXXXXXXX
  OXXXXXXXXX
  `,
  `
  O--XXXXXXX
  X--XXXXXXX
  XX----XXXX
  X--XX-XXXX
  X-XXX--XXX
  X-XXXX-XXX
  XX--XX--XX
  XX--XXX-XX
  XXXX---IXX
  XXXXXXXXXX
  `,
  `
  I-----XXXX
  XXXXX-XXXX
  XX----XXXX
  XX-XXXXXXX
  XX-----XXX
  XXXXXX-XXX
  XX-----XXX
  XX-XXXXXXX
  XX-----OXX
  XXXXXXXXXX
  `
  ],
  players: [{name: 'Jarabe', time: 8.2},{name: 'Man', time: 8.1}]

}
