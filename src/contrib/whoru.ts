import os from 'os'

import ip from 'ip'
import publicIp from 'public-ip'

import {
  Vorpal,
  CommandContext,
  Args,
}                           from 'wechaty-vorpal'
import {
  log,
}            from 'wechaty'
import moment from 'moment'
import { VERSION as WECHATY_PUPPET_VERSION } from 'wechaty-puppet'

import {
  WechatyVorpalConfig,
}                       from '../config'

interface WhoruConfig extends WechatyVorpalConfig {}

let bornDate: Date

function Whoru (config: WhoruConfig = {}) {
  log.verbose('WechatyVorpalContrib', 'Whoru(%s)', JSON.stringify(config))

  bornDate = new Date()

  const commandName = config.command ?? 'whoru'

  return function WhoruExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'WhoruExtension(vorpal)')

    vorpal
      .command(commandName, 'who are you?')
      .option('-v --verbose', 'verbose mode')
      .action(whoruAction)
  }
}

interface WhoruOptions {
  verbose?: boolean
}

async function whoruAction (
  this: CommandContext,
  args: Args
): Promise<number> {
  log.verbose('WechatyVorpalContrib', 'whoruAction("%s")', JSON.stringify(args))

  const options = args.options as any as WhoruOptions

  const wechaty = this.wechaty
  const puppet = wechaty.puppet

  const wechatyVersion = wechaty.version()
  const wechatyName = wechaty.name()

  const puppetVersion = puppet.version()
  const puppetName = puppet.name()

  const bot = wechaty.userSelf()
  const botName = bot.name()
  const botAge = moment(bornDate).fromNow()

  const reportList = [
    `My name is ${botName}, I borned at ${botAge}.`,
    `My Wechaty is ${wechatyName}@${wechatyVersion}.`,
    `My puppet is ${puppetName}@${puppetVersion} that extended from wechaty-puppet@${WECHATY_PUPPET_VERSION}.`,
  ]

  if (options.verbose) {
    const osArch     = os.arch()                                          // x64
    const osHostname = os.hostname()                                      // huan-home
    const osTotalmem = os.totalmem()                                      // 33531572224
    const osType     = os.type()                                          // 'Linux' on Linux, 'Darwin' on macOS, and 'Windows_NT' on Windows.
    const osUptime   = moment.duration(os.uptime(), 'second').humanize()  // 788467 in seconds

    const osIp = ip.address()
    const netIp = await publicIp.v4()

    reportList.push(
      '',
      [
        `I'm running on ${osHostname} (${osType}, ${osArch})`,
        `with ${Math.floor(osTotalmem / 1024 / 1024)}MB ram,`,
        `and uptime ${osUptime}.`,
      ].join(' '),
      '',
      `The local ip is ${osIp}, public ip is ${netIp}.`
    )
  }

  this.stdout.next(reportList.join('\n'))

  return 0
}

export { Whoru }
