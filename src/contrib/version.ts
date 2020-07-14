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
      .command(commandName, 'show dependency versions')
      .option('-d --dev', 'including the devDependencies')
      .action(versionAction)
  }
}

interface VersionOptions {
  dev?: boolean
}

async function versionAction (
  this: CommandContext,
  args: Args
): Promise<number> {
  log.verbose('WechatyVorpalContrib', 'versionAction("%s")', JSON.stringify(args))

  const options = args.options as any as VersionOptions

  const pkg = await readPkgUp()

  if (!pkg || !pkg.packageJson.dependencies) {
    this.stderr.next('pkg.dependencies not found')
    return 1
  }

  const dependencyList = Object.entries(pkg.packageJson.dependencies)
    .map(([name, version]) => `${name}@${version}`)

  if (options.dev) {
    if (!pkg.packageJson.devDependencies) {
      this.stderr.next('pkg.devDependencies not found')
      return 1
    }
    dependencyList.push(
      ...Object.entries(pkg.packageJson.devDependencies)
        .map(([name, version]) => `${name}@${version}`)
    )
  }

  this.stdout.next(dependencyList.join('\n'))

  return 0
}

export { Version }
