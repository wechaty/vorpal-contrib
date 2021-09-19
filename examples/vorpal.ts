import { Vorpal } from 'wechaty-vorpal'

import { Cash }                 from '../src/contrib/cash.js'

async function main () {
  const vorpal = new Vorpal()

  vorpal.use(Cash())

  await vorpal.exec('help')
}

main().catch(console.error)
