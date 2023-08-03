import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";
import type { DateTime } from "luxon";

export type ClockDataRaw = Awaited<ReturnType<typeof getClocksForDate>>
export type ClockDataSuccess = ClockDataRaw['data']
export type ClockDataError = ClockDataRaw['error']

export const getClocksForDate = async (supabase: SupabaseClient<Database>, date: DateTime) => {
    const endDate = date.plus({ days: 1 }).toFormat('yyyy-MM-ddZ');
    return await supabase
            .from('timetable')
            .select('*')
            .gte('clock_in', date.toFormat('yyyy-MM-ddZ'))
            .lt('clock_in', endDate)
            .order('clock_in', { ascending: false });
}
