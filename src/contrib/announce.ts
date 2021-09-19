import {
  log,
}                 from 'wechaty'
import type {
  Vorpal,
  CommandContext,
  Args,
}                           from 'wechaty-vorpal'

function Announce () {
  log.verbose('WechatyVorpalContrib', 'Announce()')

  return function AnnounceExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'AnnounceExtension(vorpal)')

    vorpal
      .command('announce <announcement>', 'Announce in the room')
      .option('-r --room <roomId>', 'the room to be announced')
      .action(announceAction)
  }
}

interface AnnounceOptions {
  room: string
}

async function announceAction (
  this: CommandContext,
  args: Args
): Promise<number> {
  log.verbose('WechatyVorpalContrib', 'announceAction("%s")', JSON.stringify(args))

  const announcement: string = args['announcement'] as string
  const options = args.options as any as AnnounceOptions

  const room = await this.wechaty.Room.find({ id: options.room })
  if (!room) {
    this.stderr.next('Room not found for id: ' + options.room)
    return 1
  }

  await room.announce(announcement)
  this.stdout.next(`Room<${options.room}> announced.`)
  return 0
}

export { Announce }
