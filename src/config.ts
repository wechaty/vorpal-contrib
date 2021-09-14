import { packageJson } from './package-json.js'

interface WechatyVorpalConfig {
  command?: string    // the command name
}

const VERSION = packageJson.version || '0.0.0'

export type {
  WechatyVorpalConfig,
}
export {
  VERSION,
}
