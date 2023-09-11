# Clock IT!

## DISCLAIMER

This is a work in progress and a learning project for myself. There are unconventional or even bad practices being used, sometimes due to lazyness, sometimes because I didn't know any better.  
The point being that while you're encouraged to help with this project, don't expect a highly professional setting.


## Developing

Install dependencies (this repo uses bun!):
```bash
bun install
```

Start the supabase backend (requires docker installed):

```bash
bun supabase start
```

Once you've started the supabase backend, start a development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

To create a production version of your app:

```bash
bun run build
```

You can preview the production build with `bun run preview`.

### Icon Pack used:
https://heroicons.com/