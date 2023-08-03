import { getClocksForDate } from "$lib/db/timeTable";
import { DateTime } from "luxon";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({parent}) => {
    let { supabase } = await parent()

    let { error: clock_err, data: clock_data } = await getClocksForDate(supabase, DateTime.now())

    return { clock_err, clock_data }
};