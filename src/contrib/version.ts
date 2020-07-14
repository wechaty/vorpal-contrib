import readPkgUp  from 'read-pkg-up'

import {
  Vorpal,
  CommandContext,
  Args,
}                           from 'wechaty-vorpal'
import {
  log,
}            from 'wechaty'

import {
  WechatyVorpalConfig,
}                       from '../config'

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

  const pkg = (await readPkgUp())?.packageJson

  if (!pkg) {
    this.stderr.next('readPkgUp: packageJson not found.')
    return 1
  }

  if (!options.dependencies && !options.devDependencies) {
    this.stdout.next(pkg.version)
    return 0
  }

  if (options.dependencies && pkg.dependencies) {
    this.stdout.next(
      Object.entries(pkg.dependencies)
        .map(([name, version]) => `${name}@${version}`)
        .join('\n')
    )
  }

  if (options.devDependencies && pkg.devDependencies) {
    this.stdout.next(
      Object.entries(pkg.devDependencies)
        .map(([name, version]) => `${name}@${version}`)
        .join('\n')
    )
  }

  return 0
}

export { Version }
