# wechaty-vorpal-contrib

[![Wechaty Vorpal Contrib](https://img.shields.io/badge/Wechaty-Vorpal-brightgreen.svg)](https://github.com/wechaty/wechaty-vorpal)
[![NPM](https://github.com/wechaty/wechaty-vorpal-contrib/workflows/NPM/badge.svg)](https://github.com/wechaty/wechaty-vorpal-contrib/actions?query=workflow%3ANPM)
 [![NPM Version](https://img.shields.io/npm/v/wechaty-vorpal-contrib?color=brightgreen)](https://www.npmjs.com/package/wechaty-vorpal-contrib)

Wechaty Vorpal Chat CLI (Command Line Interface)

[![Wechaty Vorpal Contrib](docs/images/vorpal-contrib.png)](https://github.com/wechaty/wechaty-vorpal-contrib)

> Image: [Tales of Zestiria](https://shyonaaisha.tumblr.com/post/146096253441/neylakiiroisenkou-tales-of-zestiria-weapons)

## Requirements

1. Node.js v16+
2. NPM v7+
3. [Wechaty](https://github.com/wechaty/wechaty) v0.40+
4. [WechatyVorpal](https://github.com/wechaty/wechaty-vorpal) v0.2+

## Usage

You are welcome to send your Vorpal Extension to our contrib by creating a Pull Request!

| # | Extension | Author | Feature |
| :--- | :--- | :--- | :--- |
| 1 | Ding | @huan | Get a reply of `dong` |
| 2 | Eval | @huan | Run JavaSCript in your Wechaty bot right in the chat window! |
| 3 | Cash | @huan | Cross-platform Linux commands in pure ES6 |
| 4 | MathMaster | @huan | Text game on WeChat: to become a math master! |
| 5 | Whoru | @huan | Make the bot do a introduction about itself |
| 6 | Version | @huan | Show the dependencies/devDependencies of the bot |

```ts
import { Wechaty }        from 'wechaty'
import { WechatyVorpal }  from 'wechaty-vorpal'
import { Eval }           from 'wechaty-vorpal-contrib'

const vorpalExtensionList = [
  Eval(), // <- Put our vorpal contrib extensions at here.
]

const VorpalPlugin = WechatyVorpal({
  room: 'Your_Vorpal_CLI_Room_ID',
  use: vorpalExtensionList,
})

const wechaty = new Wechaty()
wechaty.use(VorpalPlugin)
```

## Screenshot

### UrlLink

![Wechaty Vorpal UrlLink Extension](docs/images/wechaty-vorpal-url-link.png)

### Eval

![Wechaty Vorpal Eval Extension](docs/images/wechaty-vorpal-eval.png)

## Commands

[![Wechaty Vorpal Contrib](https://img.shields.io/badge/Wechaty%20Vorpal-Contrib-brightgreen.svg)](https://github.com/wechaty/wechaty-vorpal-contrib)

The Wechaty Vorpal Contrib includes the most useful commands from the Wechaty Contributors.

If you believe we should add more command to the contrib, please feel free to submit an proposal by creating an new issue, with your code in the PR!

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

#### Eval Example

To remove a member from a room, you can use the following `eval` code to achieve that:

```ts
eval
  const ROOM_TOPIC_RE=/Home 6/i;
  const MEMBER_NAME_RE=/纸超人/i;
  const room = await this.wechaty.Room.find({ topic: ROOM_TOPIC_RE });
  const memberList = await room.memberAll();
  const bob = memberList.filter(m => MEMBER_NAME_RE.test(m.name()))[0];
  await room.say("You have violated the code of conduct of our Wechaty Developers's Room, we need to move you out of this room.", bob);
  await this.wechaty.sleep(5000);
  await room.say('done');
  await room.del(bob);
  await this.log('done');
```

### 3 Cash

Cash is a cross-platform implementation of Unix shell commands written in straight ES6. No native compiling and no external dependencies.

```ts
import { Cash } from 'wechaty-vorpal-contrib'
vorpalExtensionList = [ Cash() ]
```

```sh
$ help

  Commands:

    alias [options] [name...]
    cat [options] [files...]
    cd [dir]
    clear
    cp [options] [args...]
    echo [options] [arg...]
     [options] [files...]
    export [options] [name...]
    false
    kill [options] [process...]
    ls [options] [paths...]
     [options] [directory...]
     [options] [args...]
    pwd [files...]
    sort [options] [files...]
    source [file] [params...]
    tail [options] [files...]
    touch [options] <files...>
    true
    grep [options] <pattern> [files...]  Grep (POSIX) implementation.
    rm [options] [files...]
     [options] [name...]
```

This extension is powered by [Cash](https://github.com/dthree/cash).

Learn more supported command at <https://github.com/dthree/cash#supported-commands>

### 4 MathMaster

Play game in WeChat and make you a master of math! (leader board support)

![Wechaty Vorpal Math Master](docs/images/math-master.png)

```ts
import { MathMaster } from 'wechaty-vorpal-contrib'
vorpalExtensionList = [ MathMaster() ]
```

### 5 Whoru

Let the bot tell you about its version & server information.

```ts
import { Whoru } from 'wechaty-vorpal-contrib'
vorpalExtensionList = [ Whoru() ]
```

### 6 Version

Let the bot tell you its dependencies/devDependencies.

```ts
import { Version } from 'wechaty-vorpal-contrib'
vorpalExtensionList = [ Version() ]
```

## Contributors

[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/0)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/0)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/1)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/1)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/2)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/2)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/3)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/3)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/4)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/4)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/5)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/5)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/6)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/6)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/images/7)](https://sourcerer.io/fame/huan/wechaty/wechaty-vorpal-contrib/links/7)

## History

### main (Sep 20, 2021)

1. Enable ESM Modules

### v0.6 (July 10, 2020)

1. Upgrade to [wechaty-vorpal](https://github.com/wechaty/wechaty-vorpal)@0.6 to enhance the Command Action Functions
1. `MathMaster` Extension for play game in WeChat!
1. Add `Whoru` and `Version` extensions.

### v0.2 (June 19, 2020)

Init the first version of Wechaty Vorpal Extensions for official Wechaty ChatOps Commands

1. `Ding` Extension for trigger a `dong` reply
1. `Eval` Extension for EVAL JavaScript code from the chat window!
1. `Cash` Extension for Cross-platform Linux commands in pure ES6

## Author

[Huan LI](https://github.com/huan) ([李卓桓](http://linkedin.com/in/zixia)), Tencent TVP of Chatbot, \<zixia@zixia.net\>

[![Profile of Huan LI (李卓桓) on StackOverflow](https://stackexchange.com/users/flair/265499.png)](https://stackexchange.com/users/265499)

## Copyright & License

- Code & Docs © 2020 Huan LI (李卓桓) \<zixia@zixia.net\>
- Code released under the Apache-2.0 License
- Docs released under Creative Commons
