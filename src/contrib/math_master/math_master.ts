/**
 * Math Master
 *  Huan <zixia@zixia.net>
 */
import {
  log,
}                   from 'wechaty'
import type {
  Vorpal,
}                   from 'wechaty-vorpal'

import type {
  WechatyVorpalConfig,
}                       from '../../config.js'

import { action }       from './action.js'

export interface MathMasterConfig extends WechatyVorpalConfig {}

function MathMaster (config: MathMasterConfig = {}) {
  log.verbose('WechatyVorpalContrib', 'MathMaster(%s)', JSON.stringify(config))

  const commandName = config.command ?? 'math_master'

  return function MathMasterExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'MathMasterExtension(vorpal)')

    vorpal
      .command(`${commandName}`, 'play the match master game')
      .option('-l --leaderboard', 'show leader board')
      .action(action)
  }
}

export { MathMaster }
