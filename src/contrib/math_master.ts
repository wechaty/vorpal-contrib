/**
 * Math Master
 *  Huan <zixia@zixia.net>
 */
import {
  interval,
}                   from 'rxjs'
import {
  tap,
  scan,
  map,
  switchMap,
  takeWhile,
  startWith,
}                   from 'rxjs/operators'
import {
  log,
  FileBox,
}                   from 'wechaty'
import {
  Vorpal,
  CommandInstance,
  Args,
}                   from 'wechaty-vorpal'
import {
  types,
}                   from 'wechaty-plugin-contrib'

import {
  WechatyVorpalConfig,
}                       from '../config'

interface State {
  question : string,
  answer   : number

  score : number
  timer : number
}

export interface MathMasterConfig extends WechatyVorpalConfig {}

function MathMaster (config: MathMasterConfig = {}) {
  log.verbose('WechatyVorpalContrib', 'MathMaster(%s)', JSON.stringify(config))

  const commandName = config.command ?? 'math_master'

  return function MathMasterExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'MathMasterExtension(vorpal)')

    vorpal
      .command(`${commandName}`, 'play the match master game')
      .action(mathMasterAction as any)
  }
}

// interface MathMasterOptions {}

async function mathMasterAction (
  this: CommandInstance,
  args: Args
): Promise<number> {
  log.verbose('WechatyVorpalContrib', 'urlLinkAction("%s")', JSON.stringify(args))

  this.stdout.next('Welcome to the Wechaty Math Master GAME!')
  const banner = FileBox.fromUrl('https://assets.tvokids.com/prod/s3fs-public/app-images/tileSM_app_mathMaster.jpg')
  await this.message.say(banner)

  const playerName = await this.prompt("What's your name?")
  await this.wechaty.sleep(1000)
  this.stdout.next(`Hello, ${playerName}! Please try your best to answer math questions!`)

  await this.wechaty.sleep(1000)
  this.stdout.next('3 ...')
  await this.wechaty.sleep(1000)
  this.stdout.next('2 ...')
  await this.wechaty.sleep(1000)
  this.stdout.next('1 ...')
  await this.wechaty.sleep(1000)
  this.stdout.next('START!')

  /**
  * RxJS Game - Inspired by Catch The Dot Game (By adamlubek)
  *  This recipe shows usage of scan operator for state management in simple game
  *  https://www.learnrxjs.io/learn-rxjs/recipes/catch-the-dot-game
  */
  const TIMER_MAX = 5

  const setTimerText = (text: number) => this.stdout.next(text)
  const makeInterval = (state: State) => interval(1000).pipe(
    map(v => TIMER_MAX - v),
    tap(setTimerText),
    map(v => ({
      ...state,
      timer: v,
    })),
  )
  const generateQuestionAnswer = (score: number) => {
    const randomNumber = () => {
      const difficulty = Math.floor(score / 3) + 1
      return Math.floor(Math.random() * Math.pow(10, difficulty))
    }

    const x = randomNumber()
    const y = randomNumber()

    return {
      answer: x + y,
      question: `${x} + ${y}`,
    }
  }
  const initialGameState: State = {
    ...generateQuestionAnswer(0),
    score : 0,
    timer : TIMER_MAX,
  }

  /**
   * Check Game Over
   */
  const isNotGameOver = (state: State) => state.timer >= 0

  const isCorrectAnswer = (state: State) => (msg: types.SayableMessage) => {
    if (typeof msg === 'string') {
      return parseInt(msg.trim(), 10) === state.answer
    }
    return false
  }

  const ask = (state: State) => {
    const {
      score,
      question,
    }             = state

    const msg = `
    Score: ${score}

    ${question} = ?
    `

    this.stdout.next(msg)
  }

  const nextState = (state: State, value: types.SayableMessage): State => {
    let newScore = state.score
    let newTimer = state.timer

    if (value) {
      const correct = isCorrectAnswer(state)(value)

      if (correct) {
        newScore++
        this.stdout.next(`Congratulations! Current score: ${newScore}`)
      } else {
        newTimer = -1 // Game Over
        this.stdout.next(`Wrong! The correct answer is: ${state.answer}, try harder next time!`)
      }
    }

    return {
      ...state,
      ...generateQuestionAnswer(newScore),
      score: newScore,
      timer: newTimer,
    }
  }

  const game$ = this.stdin.pipe(
    startWith(undefined),
    scan(nextState, initialGameState),
    takeWhile(isNotGameOver), // Wrong Answer
    tap(ask),
    switchMap(makeInterval),
    takeWhile(isNotGameOver), // Time Out
  )

  try {
    const state = await game$.toPromise()

    const gameOver = `Game Over

    ${playerName}, Your final score is: ${state.score}!
    `
    this.stdout.next(gameOver)

    return 0

  } catch (e) {
    log.error('WechatyVorpalContrib', 'MathMaster() game$.toPromise() rejection %s', e)
    return 1
  }

}

export { MathMaster }
