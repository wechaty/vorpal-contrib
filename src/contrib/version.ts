import type {
  Vorpal,
  CommandContext,
  Args,
}                           from 'wechaty-vorpal'
import {
  log,
}            from 'wechaty'

import type {
  WechatyVorpalConfig,
}                       from '../config.js'

import { packageJson } from '../package-json.js'

interface VersionConfig extends WechatyVorpalConfig {}

function Version (config: VersionConfig = {}) {
  log.verbose('WechatyVorpalContrib', 'Version(%s)', JSON.stringify(config))

  const commandName = config.command ?? 'version'

  return function VersionExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'VersionExtension(vorpal)')

    vorpal
      .command(commandName, 'show version')
      .option('-d --dependencies', 'show dependencies')
      .option('-D --devDependencies', 'show devDependencies')
      .action(versionAction)
  }
}

interface VersionOptions {
  dependencies?    : boolean
  devDependencies? : boolean
}

async function versionAction (
  this: CommandContext,
  args: Args
): Promise<number> {
  log.verbose('WechatyVorpalContrib', 'versionAction("%s")', JSON.stringify(args))

  const options = args.options as any as VersionOptions

  if (!options.dependencies && !options.devDependencies) {
    this.stdout.next(packageJson.version)
    return 0
  }

  if (options.dependencies && packageJson.dependencies) {
    this.stdout.next(
      Object.entries(packageJson.dependencies)
        .map(([name, version]) => `${name}@${version}`)
        .join('\n')
    )
  }

  if (options.devDependencies && packageJson.devDependencies) {
    this.stdout.next(
      Object.entries(packageJson.devDependencies)
        .map(([name, version]) => `${name}@${version}`)
        .join('\n')
    )
  }

  return 0
}

export { Version }
