# Sutori Game

A template for creating visual novel computer games in JavaScript, HTML and CSS.

![Screenshot of the Sutori Game Window](https://github.com/sutori-project/sutori-game/blob/main/screenshot.png?raw=true)

The template uses [Sutori JS](https://github.com/sutori-project/sutori-js) multimedia
engine, and [Neutralino](https://neutralino.js.org/) to wrap your game in an app
that can be shared with others.

It's completely free under the MIT license, cross-platform & compact thanks
to Neutralino, and super easy to use. You don't have to write any code to get up
and running.

## Getting Started

To run the demo game, do the following:

1. Clone this repo.
2. Restore the dependencies with: `npm install`
2. Make sure typescript, SASS & neutralino are installed: `npm install -g typescript sass @neutralinojs/neu`
4. Make sure neutralino is ready: `neu update`
5. Build & run with: `npm run build`

## Making It Your Own

- HTML, CSS and JS can be found in `/resources/`
- Edit the story by opening `/resources/assets/game.xml` in [Sutori Studio](https://github.com/sutori-project/sutori-studio) or any text editor (preferably with XML support).

## Why Does This Exist?

Since inception, I've wanted to make a interactive narrative system for my C++
game engine called [Xentu](https://xentu.net) but 4+ years of work on it burnt
me out, so a 4 month break to get some life things in order was a must.

With new recent enthusiasm I prototyped SutoriJS. I quickly realised that JavaScript
is a really good fit for this sort of thing. Soon after came the idea of writing
an IDE to edit the XML files I created, which spawned Sutori Studio, which led me
finally here to make distributable game template.

## Goals

The whole point of this project is to be a complete template that does not need
tampering with often. Once the first release is published, the project will go
onto a rotation to make sure the dependencies stay up to date, and any requested
features get added. Post that, I'll move on to making the IDE as robust and as
possible so that it can be used by a wide age and skill gamut.

## Support

All support is greatly appreciated!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U7U2YUV6)

## Contributors

<a href="https://github.com/sutori-project/sutori-game/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sutori-project/sutori-js" />
</a>

## License

This project uses the [MIT](LICENSE) license.

## Art credits

- `/assets/backgrounds/` - Made by [Uncle Mugen](https://lemmasoft.renai.us/forums/viewtopic.php?f=52&t=17302)