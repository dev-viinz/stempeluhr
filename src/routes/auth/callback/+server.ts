// src/routes/auth/callback/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = (async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');

	if (code) {
		await supabase.auth.exchangeCodeForSession(code);
	}

	const next = url.searchParams.get('next');
	if (next) {
		throw redirect(303, next);
	} else {
        throw redirect(303, '/app');
    }

}) satisfies RequestHandler;
