import { Contact } from 'wechaty'
import { CommandContext } from 'wechaty-vorpal'

interface ScoreBoard {
  [id: string]: {
    name: string,
    score: number,
    comment?: string,
  }
}

const scoreBoard: ScoreBoard = {}

function sortScoreBoard (
  a: ScoreBoard['id'],
  b: ScoreBoard['id'],
): number {
  return b.score - a.score
}

function reportLeaderBoard (): string {
  const scoreList = Object.values(scoreBoard)
    .sort(sortScoreBoard)

  let ranking = 0
  const board = scoreList
    .map(score => `#${++ranking} - ${score.name}(${score.score}) ${score.comment || ''}`)
    .join('\n')

  return [
    'Math Master Leader Board',
    '$ math_master --leaderboard',
    '',
    board,
  ].join('\n')
}

function update (
  player: Contact,
  score: number,
): void {
  if (!(player.id in scoreBoard)) {
    scoreBoard[player.id] = {
      name: player.name(),
      score: score,
    }
  }

  if (score > scoreBoard[player.id]?.score) {
    scoreBoard[player.id].score = score
  }
}

async function registerLeaderBoard (
  context: CommandContext,
  player: Contact,
  score: number,
): Promise<void> {
  update(player, score)

  let scoreList = Object.values(scoreBoard)
    .map(v => v.score)
  scoreList = [...new Set(scoreList)].sort((a, b) => b - a)

  const ranking = 1 + scoreList.indexOf(score)

  const comment = await context.ask([
    `You ranking is #${ranking}`,
    '',
    'What do you want to say now?',
  ].join('\n'))

  if (typeof comment === 'string' && comment && comment !== '0') {
    scoreBoard[player.id] = {
      ...scoreBoard[player.id],
      comment,
    }
  }
}

export {
  registerLeaderBoard,
  reportLeaderBoard,
}
