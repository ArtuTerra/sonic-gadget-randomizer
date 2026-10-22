# Gadget data

## Refresh the gadget list

Game updates change the wiki table. From the repo root:

```bash
npm run import:gadgets
```

That fetches the [gadget page](<https://sonic.fandom.com/wiki/Gadget_(Sonic_Racing:_CrossWorlds)>), rewrites `src/data/gadgets.json`, and saves 128px WebP icons in `public/icons/gadgets/`. Add an original one-line effect in `scripts/gadget-copy.ts` before importing a gadget the wiki has not listed before. The script keeps existing numeric codes and does not reuse one if a gadget disappears.
