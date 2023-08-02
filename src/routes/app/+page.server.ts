import { fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from '../login/$types.js'
import type { Action, Actions } from './$types.js';
import { getTodayFormatted } from '$lib/helpers/dateHelpers.js';

export const load = (async ({ locals: { supabase, getSession }, parent }) => {
    const { profile } = await parent();
    return { profile }
}) satisfies PageServerLoad;

type ClockStatus = 'success' | 'error'

export const actions: Actions = {
    clock_in: async ({ locals: { supabase } }) => {
        let clockInError = {
            clock_status: 'error' as ClockStatus,
            message: 'Could not clock in.'
        }
        const { data, error: checkError } = await supabase
                    .from('timetable')
                    .select('*')
                    .filter('clock_in', 'gte', getTodayFormatted())

        if (checkError && !data) {
            return fail(500, clockInError);
        }

        for (const entry of data) {
            if (!entry.clock_out) {
                clockInError.message = 'You need to clock out first.'
                return fail(400, clockInError);
            }
        }

        const { error: insertError } = await supabase
                        .from('timetable')
                        .insert({clock_in: new Date().toISOString()})
        
        if (insertError) {
            return fail(500, clockInError);
        }

        // if clock in was successful
        return { 
            clock_status: 'success' as ClockStatus,
            message: 'Clocked in!'
        }
    },

    clock_out: async ({locals: { supabase }}) => {
        let clockOutError = {
            clock_status: 'error' as ClockStatus,
            message: 'Could not clock out.'
        }

        const { data, error: checkError } = await supabase
                    .from('timetable')
                    .select('*')
                    .filter('clock_in', 'gte', getTodayFormatted())

        if (checkError && !data) {
            return fail(500, clockOutError);
        }

        const latestClockIn = data.reduce((a, b) => new Date(a.clock_in) > new Date(b.clock_in) ? a : b);

        if (latestClockIn.clock_out) {
            clockOutError.message = 'You\'re already clocked out.'
            return fail(400, clockOutError);
        }

        const { error: insertError } = await supabase
                            .from('timetable')
                            .update({clock_out: new Date().toISOString()})
                            .eq('id', latestClockIn.id);

        if (insertError) {
            return fail(500, clockOutError)
        }

        // if clock out was successful
        return {
            clock_status: 'success' as ClockStatus,
            message: 'Clocked out!'
        }
    }
}
