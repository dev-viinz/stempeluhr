// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url, locals: { getSession } }) => {
  const session = await getSession()

  // if the user is already logged in return them to the app page
  if (session) {
    throw redirect(303, '/app')
  }

  return { url: url.origin }
}
