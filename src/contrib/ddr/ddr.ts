/**
 * Math Master
 *  Huan <zixia@zixia.net>
 */
import {
  log,
}                       from 'wechaty'
import {
  Vorpal,
}                   from 'wechaty-vorpal'

import {
  WechatyVorpalConfig,
}                       from '../../config'

import {
  DEFAULT_TIMEOUT,
  DEFAULT_NAME,
}                     from './config'
import { action }     from './action'

export interface DdrConfig extends WechatyVorpalConfig {}

export interface DdrOptions {
  ding       : string,
  dong       : string,
  timeout    : number,
  summary?   : boolean,
  reset?     : boolean,
  monitor?   : boolean | number | string,
  unmonitor? : boolean,
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
      .option('-u --unmonitor', 'Unmonitor the DDR in the background')
      .option('-s --summary', 'Summary the DDR status')
      .option('-r --reset', 'Reset all DDR data that received')
      .action(action)
  }
}

export {
  DEFAULT_OPTIONS,
  Ddr,
}
