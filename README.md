<div align="center" style="display:flex;flex-direction:column;padding-bottom:3rem">
  <a href="https://canvasdraw.limboy.me">
    <img width="540" src="./packages/frontend/public/assets/og.jpg" alt="draw with code" />
  </a>
  <h3> Draw with code </h3>
</div>

![](canvasdraw.jpg)

### Try it now
Go to https://canvasdraw.limboy.me to start drawing.

### Installation
#### Requirements
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

#### Clone the repo

```
git clone https://github.com/limboy/canvasdraw.git
```

#### Install the dependencies

```sh
pnpm install
```

#### Start the server

```sh
pnpm build
pnpm dev
```

open http://localhost:3727 and start drawing.


#### Deploy

```sh
pnpm build
pnpm serve
```

it will listen to 3727 port, proxy nginx request to `http://localhost:3727` like this:

```
location / {
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_pass http://localhost:3727;
}
```