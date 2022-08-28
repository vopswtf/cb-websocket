<img src="https://i.imgur.com/XwDmpqJ.png" width="128">


# websocket for protocol cheatbreaker but in nodejs
<p>
   <a href="https://discord.gg/6Xmk3HHR5v">
   <img src="https://img.shields.io/discord/893202408501551204?color=blue&label=support%20discord"
      alt="support"></a>
<p>

i was bored so i made this. my one rule for this project was to work on it at 4am/late at night.

this was tested on [Protocol CheatBreaker 1.6.25](https://www.mediafire.com/folder/7lha1eobn2wji/protocol). if you want to change websocket url search ``ws://coolwebsocket.com``.

follow me on twitter https://twitter.com/vopswtf

## Notes
i never worked on animated capes because i dont like them. feel free to add support for them if you want

you should probably use a local mongodb server if u care enough.
if you dont care too much then u could use [clever cloud](https://www.clever-cloud.com)

there are probably bugs but i dont really care enough to fix them.

i wont help you edit the client in the support discord. i will only help with setup of the websocket.

this was built and tested for 1.7 cheatbreaker. 1.8 works but i havent tested that much lol

friendRankImage in ranks can be the following
```json
"cheatbreaker" -- cheatbreaker logo (red)
"highroller" -- highroller crown
"twitch" -- twitch icon
"youtube" -- youtube icon
"block" -- grass block
"logo" -- minehq logo
```

cosmetic format
```json
id,scale,resourceLocation,name,type,animated
````

## Installation

Install [Node.js](https://nodejs.org/en/)

Clone the repository.
```bash
git clone https://github.com/vopswtf/cb-websocket.git
```

Install NPM packages.
```bash
npm install
```

Edit `config.json`.

Run the websocket.
```bash
npm run start
```

## Contact

support discord - [discord.gg/6Xmk3HHR5v](https://discord.gg/6Xmk3HHR5v)
   
website - [vops.cc](https://vops.cc)

twitter - [@vopswtf](https://twitter.com/vopswtf)
