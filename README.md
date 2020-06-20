# wechaty-vorpal-contrib

[![Wechaty Vorpal Contrib](https://img.shields.io/badge/Wechaty-Vorpal-brightgreen.svg)](https://github.com/wechaty/wechaty-vorpal-contrib)
[![NPM](https://github.com/wechaty/wechaty-vorpal-contrib/workflows/NPM/badge.svg)](https://github.com/wechaty/wechaty-vorpal-contrib/actions?query=workflow%3ANPM)
 [![NPM Version](https://img.shields.io/npm/v/wechaty-vorpal-contrib?color=brightgreen)](https://www.npmjs.com/package/wechaty-vorpal-contrib)

Wechaty Vorpal Chat CLI (Command Line Interface)

[![Wechaty Vorpal Contrib](docs/images/vorpal-contrib.png)](https://github.com/wechaty/wechaty-vorpal-contrib)

> Image: [Tales of Zestiria](https://shyonaaisha.tumblr.com/post/146096253441/neylakiiroisenkou-tales-of-zestiria-weapons)

## Requirements

1. Node.js v12+
1. [Wechaty](https://github.com/wechaty/wechaty) v0.40+
1. [WechatyVorpal](https://github.com/wechaty/wechaty-vorpal) v0.2+

## Usage

You are welcome to send your Vorpal Extension to our contrib by creating a Pull Request!

| # | Extension | Author | Feature |
| :--- | :--- | :--- | :--- |
| 1 | Ding | @huan | Get a reply of `dong` |
| 2 | Eval | @huan | Run JavaSCript in your Wechaty bot right in the chat window! |

```ts
import { Wechaty }        from 'wechaty'
import { WechatyVorpal }  from 'wechaty-vorpal'
import { Ding }           from 'wechaty-vorpal-contrib'

const vorpalExtensionList = [
  Ding(), // <- Put our vorpal contrib extensions at here.
]

const VorpalPlugin = WechatyVorpal({
  room: 'Your_Vorpal_CLI_Room_ID',
  use: vorpalExtensionList,
})

const wechaty = new Wechaty()
wechaty.use(VorpalPlugin)
```

### 1 Ding

```ts
import { Ding } from 'wechaty-vorpal-contrib'
vorpalExtensionList = [ Ding() ]
```

### 2 Eval

```ts
import { Eval } from 'wechaty-vorpal-contrib'
vorpalExtensionList = [ Eval() ]
```

## History

### v0.2 (Jun 19, 2020)

Init the first version of Wechaty Vorpal Extensions for official Wechaty ChatOps Commands

1. `Ding` Extension for trigger a `dong` reply
1. `Eval` Extension for EVAL JavaScript code from the chat window!

## Contributors

[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/0)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/0)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/1)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/1)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/2)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/2)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/3)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/3)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/4)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/4)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/5)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/5)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/6)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/6)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/7)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/7)

## Author

[Huan LI](https://github.com/huan) ([李卓桓](http://linkedin.com/in/zixia)), Tencent TVP of Chatbot, \<zixia@zixia.net\>

[![Profile of Huan LI (李卓桓) on StackOverflow](https://stackexchange.com/users/flair/265499.png)](https://stackexchange.com/users/265499)

## Copyright & License

- Code & Docs © 2020 Huan LI (李卓桓) \<zixia@zixia.net\>
- Code released under the Apache-2.0 License
- Docs released under Creative Commons
