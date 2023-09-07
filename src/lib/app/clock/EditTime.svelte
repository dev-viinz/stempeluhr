<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import type { Database } from "../../../types/supabase";
	import { invalidateAll } from "$app/navigation";
	import { modalStore } from "@skeletonlabs/skeleton";
	import Spinner from "$lib/icons/Spinner.svelte";
	import { onMount } from "svelte";
	import { error } from "@sveltejs/kit";
	import { DateTime } from "luxon";
	import type { ClockDataSuccess } from "$lib/db/timeTable";

    export let supabase: SupabaseClient<Database>;
    export let entryToEdit: string;
    
    let startDate: string;
    let endDate: string;
    let dbData: {
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

    const editEntry = async () => {
        let newStartDate = DateTime.fromISO(dbData.clock_in).set({hour: parseInt(startDate.slice(0, 2)), minute: parseInt(startDate.slice(-2))});
        let newEndDate = DateTime.fromISO(dbData.clock_in).set({hour: parseInt(endDate.slice(0, 2)), minute: parseInt(endDate.slice(-2))});
        const { error } = await supabase
                        .from('timetable')
                        .update({clock_in: newStartDate.toISO()!, clock_out: newEndDate.toISO()})
                        .eq('id', entryToEdit)
        // TODO: handle error?
        if (error) {
            console.log(error.message);
        }
        await invalidateAll();
        modalStore.close();
    }
    onMount(async () => {
        loading = true;
        const {data} = await supabase
                            .from('timetable')
                            .select('*')
                            .eq('id', entryToEdit)
                            .single()

        if (!data) {
            throw error(404, 'Couldn\'t find.');
        }
        dbData = data
        
        startDate = DateTime.fromISO(dbData.clock_in).toFormat('HH:mm');
        endDate = dbData.clock_out ? DateTime.fromISO(dbData.clock_out).toFormat('HH:mm') : '';
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
