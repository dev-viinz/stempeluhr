<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import type { Database } from "../../../types/supabase";
	import { invalidateAll } from "$app/navigation";
	import { getModalStore, getToastStore } from "@skeletonlabs/skeleton";
	import Spinner from "$lib/icons/Spinner.svelte";
	import { onMount } from "svelte";
	import { error } from "@sveltejs/kit";
	import { DateTime } from "luxon";
	import { getClocksForDate, type ClockDataSuccess } from "$lib/db/timeTable";
	import { checkIfTimeSpansIntersect } from "$lib/helpers/timeHelpers";

    export let supabase: SupabaseClient<Database>;
    export let entryToEdit: string;
    
    const modalStore = getModalStore();
    
    let startDate: string;
    let endDate: string;
    let dbDataForTheDay: Exclude<ClockDataSuccess, null>;
    let dbDataEntryToEdit: {
        clock_in: string;
        clock_out: string | null;
        created_at: string | null;
        id: string;
        user_id: string | null;
    };

    // idk
    export let parent: any;
    $: parent;

    let timeToSet: string, loading: boolean;

    const toastStore = getToastStore();

    const editEntry = async () => {
        const hasError = isValidTime();
        if (hasError) {
            modalStore.close();
            return toastStore.trigger({message: hasError, background: 'variant-filled-error', timeout: 5000});
        }
        let newStartDate = DateTime.fromISO(dbDataEntryToEdit.clock_in).set({hour: parseInt(startDate.slice(0, 2)), minute: parseInt(startDate.slice(-2))});
        let newEndDate = endDate ? DateTime.fromISO(dbDataEntryToEdit.clock_in).set({hour: parseInt(endDate.slice(0, 2)), minute: parseInt(endDate.slice(-2))}) : null;
        const { error } = await supabase
                        .from('timetable')
                        .update({clock_in: newStartDate.toISO()!, clock_out: newEndDate ? newEndDate.toISO() : newEndDate})
                        .eq('id', entryToEdit)
        // TODO: handle error?
        if (error) {
            console.log(error.message);
        }
        await invalidateAll();
        modalStore.close();
    }

    function isValidTime(): string | null {
        if (!startDate || !endDate) return 'Please set both start and end time.';
        const baseDate = DateTime.now();
        const start = baseDate.set({hour: parseInt(startDate.slice(0, 2)), minute: parseInt(startDate.slice(-2))});
        const end = baseDate.set({hour: parseInt(endDate.slice(0, 2)), minute: parseInt(endDate.slice(-2))});
        if (start > end) {
            return 'Start time must be before end time.';
        }

        for (const entry of dbDataForTheDay) {
            if (entry.id === entryToEdit) continue;
            if (entry.clock_out === null) return 'You have to clock out first.';
            if (checkIfTimeSpansIntersect(start, end, DateTime.fromISO(entry.clock_in), DateTime.fromISO(entry.clock_out))) {
                console.log(entry.clock_in);
                return 'Time spans must not intersect.';
            }
        }
        return null;
    }

    onMount(async () => {
        loading = true;
        let {data} = await supabase
                            .from('timetable')
                            .select('*')
                            .eq('id', entryToEdit)
                            .single();
                            
        if (!data) {
            throw error(404, 'Couldn\'t find.');
        }
        dbDataEntryToEdit = data;

        let { data: dataForTheDay, error: err } = await getClocksForDate(supabase, DateTime.fromISO(dbDataEntryToEdit.clock_in));
        if (err || dataForTheDay === null) {
            throw error(500, err?.message || 'Couldn\'t get data for the day. Please try again.');
        }
        dbDataForTheDay = dataForTheDay;
        
        startDate = DateTime.fromISO(dbDataEntryToEdit.clock_in).toFormat('HH:mm');
        endDate = dbDataEntryToEdit.clock_out ? DateTime.fromISO(dbDataEntryToEdit.clock_out).toFormat('HH:mm') : '';
        loading = false;
    });

</script>

<slot />
<div class="card text-center">
    {#if loading}
        <section class="p-20">
            <Spinner />
        </section>
    {:else}
        <header class="card-header font-bold">Set the Time:</header>
        <section class="p-4">
            <input type="time" bind:value={startDate}>
            <input type="time" bind:value={endDate}>
        </section>
        <footer class="card-footer mt-3">
            <button class="btn variant-filled-error" on:click={() => editEntry()}>
                Save
            </button>
            <button class="btn variant-filled-surface" on:click={() => modalStore.close()}>
                Cancel
            </button>
        </footer>
    {/if}
</div>
