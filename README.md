# CrossWorlds Gadget Randomizer

A fan-made gadget build randomizer for [Sonic Racing: CrossWorlds](https://sonic.fandom.com/wiki/Sonic_Racing:_CrossWorlds).

**Live:** <https://sonic-gadget-randomizer.arthur-terra.workers.dev>

- Random **valid** gadget builds for every plate, Normal through Master
- Owned gadgets picker, so rolls only use what you have
- Optional upcoming gadgets
- Share links: the URL hash (`#b=...`) reopens the same build
- Installable PWA that works offline

**Fan project, not affiliated with SEGA.**

## Setup

Requires Node.js 22 (see `.nvmrc`).

```bash
npm ci          # install
npm run dev     # dev server at http://localhost:5173
npm run build   # production build in dist/
npm run preview # serve dist/ at http://localhost:4173
```

## More docs

- [Development](docs/DEVELOPMENT.md): scripts, project layout, plate rules, how rolls work, roadmap
- [Gadget data](docs/DATA.md): refreshing the gadget list and icons
- [Deploy](docs/DEPLOY.md): Cloudflare Worker and other hosts
- [PWA](docs/PWA.md): what the PWA does and installing on Android
- [Plan](docs/PLAN.md): full project plan and milestones
- [AGENTS.md](AGENTS.md): notes for AI assistants
