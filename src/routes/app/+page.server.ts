import { ActionFailure, fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from '../login/$types.js'
import type { Action, Actions } from './$types.js';
import { DateTime } from 'luxon';

export const load = (async ({ locals: { supabase, getSession }, parent }) => {
    const { profile } = await parent();
    return { profile }
}) satisfies PageServerLoad;

type ClockStatus = 'success' | 'error'

export type ClockReturnMessage = {
    clock_status: ClockStatus,
    message: string
}

export const actions: Actions = {
    clock_in: async ({ locals: { supabase } }) => {
        let clockInError: ClockReturnMessage = {
            clock_status: 'error' satisfies ClockStatus,
            message: 'Could not clock in.'
        }

        const clockInTime = DateTime.now().toISO()!;
        const { data, error: checkError } = await supabase
                    .from('timetable')
                    .select('*')
                    .filter('clock_in', 'gte', DateTime.now().toISODate())

        if (checkError && !data) {
            return fail(500, clockInError);
        }

        for (const entry of data) {
            if (!entry.clock_out) {
                clockInError.message = 'You need to clock out first.';
                return fail(400, clockInError);
            }
            if (DateTime.fromISO(entry.clock_out) > DateTime.fromISO(clockInTime)) {
                clockInError.message = 'You\'ve already clocked out after the current time.';
                return fail(400, clockInError);
            }
        }

        const { error: insertError } = await supabase
                        .from('timetable')
                        .insert({clock_in: clockInTime ?? ''})
        
        if (insertError) {
            return fail(500, clockInError);
        }

        // if clock in was successful
        return { 
            clock_status: 'success' satisfies ClockStatus,
            message: 'Clocked in!'
        } as ClockReturnMessage;
    },

    clock_out: async ({locals: { supabase }}) => {
        let clockOutError = {
            clock_status: 'error' satisfies ClockStatus,
            message: 'Could not clock out.'
        }

        const { data, error: checkError } = await supabase
                    .from('timetable')
                    .select('*')
                    .filter('clock_in', 'gte', DateTime.now().toISODate())

        if (checkError && !data) {
            return fail(500, clockOutError);
        }

        if (data.length === 0) {
            clockOutError.message = 'You haven\'t clocked in yet';
            return fail(400, clockOutError);
        }

        const latestClockIn = data.reduce((a, b) => DateTime.fromISO(a.clock_in) > DateTime.fromISO(b.clock_in) ? a : b);

        if (latestClockIn.clock_out) {
            clockOutError.message = 'You\'re already clocked out.'
            return fail(400, clockOutError);
        }

        const clockOutDate = DateTime.now().toISO();
        if (!clockOutDate) return fail(500, clockOutError);

        const { error: insertError } = await supabase
                            .from('timetable')
                            .update({ clock_out: clockOutDate })
                            .eq('id', latestClockIn.id);

        if (insertError) {
            return fail(500, clockOutError);
        }

        // if clock out was successful
        return {
            clock_status: 'success' satisfies ClockStatus,
            message: 'Clocked out!'
        }
    }
}
