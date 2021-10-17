/**
 * Math Master
 *  Huan <zixia@zixia.net>
 */
import {
  log,
}                       from 'wechaty'
import type {
  CommandContext,
  Args,
}                   from 'wechaty-vorpal'

import { Reporter }   from './reporter.js'
import { Monitor }    from './monitor.js'

import {
  DEFAULT_OPTIONS,
  DdrOptions,
}                     from './ddr.js'

async function action (
  this: CommandContext,
  args: Args,
): Promise<number> {
  log.verbose('WechatyVorpalContrib', 'ddrAction("%s")', JSON.stringify(args))

  // console.info('args', args)
  const normalizedOptions: DdrOptions = {
    ...DEFAULT_OPTIONS,
    ...args.options,
  }

  const monitor  = new Monitor(normalizedOptions, this.message)
  const reporter = new Reporter(normalizedOptions, this.message, monitor)

  if (normalizedOptions.summary) {
    this.stdout.next(reporter.summaryAll())
    return 0
  }

  if (normalizedOptions.reset) {
    reporter.reset()
    this.stdout.next('Reset done.')
    return 0
  }

  if (normalizedOptions.monitor) {
    if (monitor.busy()) {
      this.stderr.next('DDR monitor has already started.')
      return 1
    }

    monitor.start(normalizedOptions.monitor)
    const list = [
      'DDR monitor started.',
      `Timeout: ${normalizedOptions.timeout}`,
    ]
    if (typeof normalizedOptions.monitor !== 'boolean') {
      list.push(`Schedule tests every ${normalizedOptions.monitor}`)
    }
    list.push(
      `Trigger: ${normalizedOptions.ding}`,
      `Expect: ${normalizedOptions.dong}`,
    )
    this.stdout.next(list.join('\n'))
    return 0
  }

  if (normalizedOptions.unmonitor) {
    if (!monitor.busy()) {
      this.stderr.next('DDR monitor is not running.')
      return 1
    }
    monitor.stop()
    this.stderr.next('DDR monitor has been stopped.')
    return 0
  }

  if (normalizedOptions.ignore) {
    this.stdout.next(JSON.stringify(args))
    return 0
  }

  if (normalizedOptions.unignore) {
    this.stdout.next(JSON.stringify(args))
    return 0
  }

  try {
    await monitor.ddr()

    return 0

  } catch (e) {
    log.error('WechatyVorpalContrib', 'Ddr() ddr$.toPromise() rejection %s', e)
    const name = (e as Error).name
    const message = (e as Error).message
    const stack = (e as Error).stack
    this.log([
      name,
      message,
      stack,
    ].join('\n'))
    return 1
  }

}

export { action }
