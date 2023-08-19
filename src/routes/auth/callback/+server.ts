// src/routes/auth/callback/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ErrorCodes } from '$lib/constants/ErrorCodes';

export const GET = (async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');

	if (code) {
        try {
            await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
            console.warn(error);
            throw redirect(303, '/error?errCode=' + ErrorCodes.CODE_EXCHANGE_FAILED);
        }
	}

	const next = url.searchParams.get('next');
	if (next) {
		throw redirect(303, next);
	} else {
        throw redirect(303, '/app');
    }

}) satisfies RequestHandler;
