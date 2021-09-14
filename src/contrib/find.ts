import {
  Vorpal,
  log,
  CommandContext,
  Args,
}                           from 'wechaty-vorpal'

import { regexFromString } from '../utils/regex-from-string.js'

function Find () {
  log.verbose('WechatyVorpalContrib', 'Find()')

  return function FindExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'FindExtension(vorpal)')

    vorpal
      .command('find', 'find the room or contact')
      .option('-n --name <name>', 'name of the contact')
      .option('-t --topic <topic>', 'topic of the room')
      .option('-r --regex', 'RegExp mode, convert string to RegExp to match.')
      .action(findAction as any)
  }
}

interface FindOptions {
  name?: string,
  topic?: string,
  regex?: boolean,
}

async function findAction (
  this: CommandContext,
  args: Args
): Promise<number> {
  log.verbose('WechatyVorpalContrib', 'findAction("%s")', JSON.stringify(args))

  const options: FindOptions = args.options

  const idList: string[] = []

  if (options.name) {
    const re = options.regex
      ? regexFromString(options.name)
      : new RegExp(`^${options.name}$`)

    const contactList = await this.message.wechaty.Contact.findAll({ name: re })
    idList.push(
      ...contactList
        .map(c => c.id)
    )
  }

  if (options.topic) {
    const re = options.regex
      ? regexFromString(options.topic)
      : new RegExp(`^${options.topic}$`)

    const roomList = await this.message.wechaty.Room.findAll({ topic: re })
    idList.push(...roomList
      .map(r => r.id)
    )
  }

  this.stdout.next(idList.join('\n'))

  return 0
}

export { Find }
