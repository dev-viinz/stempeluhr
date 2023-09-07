# Clock IT!

## DISCLAIMER

This is a work in progress and a learning project for myself. There are unconventional or even bad practices being used, sometimes due to lazyness, sometimes because I didn't know any better.  
The point being that while you're encouraged to help with this project, don't expect a highly professional setting.


## Developing

Install dependencies (you can also use npm or yarn instead of pnpm):
```bash
pnpm install
```

Start the supabase backend (requires docker installed):

```bash
pnpm supabase start
```

Once you've started the supabase backend, start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

### Icon Pack used:
https://heroicons.com/