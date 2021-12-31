import type { Message } from 'wechaty'

import type { State } from './reducer.js'

interface DdrStore {
  stateList: State[],
  monitor: {
    timer?    : ReturnType<typeof setTimeout>,
    timeout?  : number | string,
    interval? : string,
  }
}

class Store {

  protected static memory: {
    [key: string]: DdrStore
  } = {}

  constructor (
    protected message: Message) {
  }

  protected id (): string {
    const botId = this.message.wechaty.currentUser.id
    const talkerId = this.message.talker().id
    const roomId = this.message.room()?.id || ''

    return `${botId}<${talkerId}#${roomId}`
  }

  protected klass (): typeof Store {
    // https://stackoverflow.com/a/29244254/1123955
    return this.constructor as typeof Store
  }

  get (): DdrStore {
    const id    = this.id()
    const klass = this.klass()

    if (!(id in klass.memory)) {
      klass.memory[id] = {
        monitor: {},
        stateList: [],
      }
    }
    return klass.memory[id]!
  }

  clear (all = false): void {
    const klass = this.klass()
    if (all) {
      klass.memory = {}
      return
    }

    const id = this.id()
    delete klass.memory[id]
  }

}

export { Store }
