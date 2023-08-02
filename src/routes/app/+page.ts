import { getTodayFormatted } from "$lib/helpers/dateHelpers";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({parent}) => {
    let { supabase } = await parent()

    let { error: clock_err, data: clock_data } = await supabase
            .from('timetable')
            .select('*')
            .filter('clock_in', 'gte', getTodayFormatted())
            .order('clock_in', { ascending: false });

    return { clock_err, clock_data }
};