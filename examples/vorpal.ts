import Vorpal from 'vorpal'

import { Cash }                 from '../src/contrib/cash'

async function main () {
  const vorpal = new Vorpal()

  vorpal.use(Cash())

  vorpal
    .delimiter('>')
    .show()
}

main().catch(console.error)
