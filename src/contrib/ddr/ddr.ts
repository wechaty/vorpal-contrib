/**
 * Math Master
 *  Huan <zixia@zixia.net>
 */
import {
  log,
}                       from 'wechaty'
import type {
  Vorpal,
}                   from 'wechaty-vorpal'

import type {
  WechatyVorpalConfig,
}                       from '../../config.js'

import {
  DEFAULT_TIMEOUT,
  DEFAULT_NAME,
}                     from './config.js'
import { action }     from './action.js'

export interface DdrConfig extends WechatyVorpalConfig {}

export interface DdrOptions {
  ding       : string,
  dong       : string,

  timeout    : number | string,
  summary?   : boolean,
  reset?     : boolean,

  monitor?   : boolean | number | string,
  unmonitor? : boolean,

  ignore?   : boolean | string,
  unignore? : boolean | string,
}

const DEFAULT_OPTIONS: DdrOptions = {
  ding: 'ding',
  dong: 'dong',
  timeout: DEFAULT_TIMEOUT,
}

function Ddr (config: DdrConfig = {}) {
  log.verbose('WechatyVorpalContrib', 'Ddr(%s)', JSON.stringify(config))

  const commandName = config.command ?? DEFAULT_NAME

  return function DdrExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'DdrExtension(vorpal)')

    vorpal
      .command(`${commandName}`, 'Calculate the Ding Dong Rate (DDR)')
      .option('-d --ding <ding>', 'Define the message for sending. (default `ding`)')
      .option('-D --dong <dong>', 'Define the expected message for receiving. (default `dong`)')
      .option('-t --timeout <timeout>', `Define the maximum seconds for waiting a dong after ding. (default ${DEFAULT_TIMEOUT}s)`)

      .option('-m --monitor [interval seconds]', 'Monitor the DDR in the background (specific an interval seconds to schedule tests)')
      .option('-M --unmonitor', 'Unmonitor the DDR in the background')

      .option('-i --ignore [@bot]', 'TBW: Ignore bot when calc DDR')
      .option('-I --unignore [@bot]', 'TBW: Unignore bot when calc DDR')

      .option('-s --summary', 'Summary the DDR status')
      .option('-r --reset', 'Reset all DDR data that received')
      .action(action)
  }
}

export {
  DEFAULT_OPTIONS,
  Ddr,
}
