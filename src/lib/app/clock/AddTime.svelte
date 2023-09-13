<!-- similar to EditTime, except for adding new data -->
<script lang="ts">
    import { DateTime } from "luxon";
    import { Modal, getModalStore, getToastStore } from "@skeletonlabs/skeleton";
    import type { ModalComponent } from "@skeletonlabs/skeleton";
    import { getClocksForDate, type ClockDataSuccess } from "$lib/db/timeTable";
    import Spinner from "$lib/icons/Spinner.svelte";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import type { Database } from "../../../types/supabase";
	import { error } from "@sveltejs/kit";
	import { onMount } from "svelte";
	import { invalidateAll } from "$app/navigation";
	import { checkIfTimeSpansIntersect } from "$lib/helpers/timeHelpers";

    // props
    export let supabase: SupabaseClient<Database>;
    export let date: DateTime = DateTime.now();
    // this is just to prevent a waning in the browser
    export let parent: ModalComponent;
    $: parent;

    const modalStore = getModalStore();
    const toastStore = getToastStore();

    let startTime: string;
    let endTime: string;
    let dbDataForTheDay: Exclude<ClockDataSuccess, null>;
    let loading: boolean = false;
    onMount(async () => {
        loading = true;
        startTime = date.toFormat('HH:mm');
        endTime = date.toFormat('HH:mm');
        const { data, error: err } = await getClocksForDate(supabase, date);
        if (err) {
            throw error(500, err.message);
        }
        dbDataForTheDay = data;
        loading = false;
    });

    const addEntry = async () => {
        const hasError = isValidTime();
        if (hasError) {
            modalStore.close();
            return toastStore.trigger({message: hasError, background: 'variant-filled-error', timeout: 5000});
        }
        const newStartTime = date.set({hour: parseInt(startTime.slice(0, 2)), minute: parseInt(startTime.slice(-2))}).toISO();
        const newEndTime = date.set({hour: parseInt(endTime.slice(0, 2)), minute: parseInt(endTime.slice(-2))}).toISO();
        if (!newStartTime) throw error(500, 'Couldn\'t parse start time.');
        if (!newEndTime) throw error(500, 'Couldn\'t parse end time.');
        const { error: err } = await supabase
                            .from('timetable')
                            .insert({ clock_in: newStartTime, clock_out: newEndTime });
        if (err) {
            throw error(500, err.message);
        }
        modalStore.close();
        invalidateAll();
    }

    function isValidTime(): string | null {
        if (!startTime || !endTime) return 'Please set both start and end time.';
        const baseDate = DateTime.now();
        const start = baseDate.set({hour: parseInt(startTime.slice(0, 2)), minute: parseInt(startTime.slice(-2))});
        const end = baseDate.set({hour: parseInt(endTime.slice(0, 2)), minute: parseInt(endTime.slice(-2))});
        if (start > end) {
            return 'Start time must be before end time.';
        }

        for (const entry of dbDataForTheDay) {
            if (entry.clock_out === null) return 'You have to clock out first.';
            if (checkIfTimeSpansIntersect(start, end, DateTime.fromISO(entry.clock_in), DateTime.fromISO(entry.clock_out))) {
                return 'Time spans must not intersect.';
            }
        }
        return null;
    }

</script>

<slot />

<div class="card text-center">
    <header class="card-header font-bold">Set the Time:</header>
    <section class="p-4">
        <input type="time" bind:value={startTime}>
        <input type="time" bind:value={endTime}>
    </section>
    <footer class="card-footer mt-3">
        <button class="btn variant-filled-error" on:click={async () => await addEntry()}>
            Add
        </button>
        <button class="btn variant-filled-surface" on:click={() => modalStore.close()}>
            Cancel
        </button>
    </footer>
</div>
