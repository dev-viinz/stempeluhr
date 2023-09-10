<script lang="ts">
	import Clock from "$lib/app/clock/Clock.svelte";
	import TimesTable from "$lib/app/clock/TimesTable.svelte";
	import { getClocksForDate } from "$lib/db/timeTable";
	import Spinner from "$lib/icons/Spinner.svelte";
	import type { ModalComponent } from "@skeletonlabs/skeleton";
    import { DatePicker } from "date-picker-svelte"
	import { getLocaleDefaults } from "date-picker-svelte/locale";
	import { DateTime } from "luxon";

    export let data;

    $: ({ supabase } = data)

    $: dumbDate = new Date();
    $: selectedDate = DateTime.fromISO(dumbDate.toISOString());
    $: clock_data_promise = getClocksForDate(supabase, selectedDate);
</script>
<div class="flex flex-col gap-y-4 items-center justify-center">
    <Clock clockSize="large" />
    <DatePicker bind:value={dumbDate} locale={getLocaleDefaults()} />
    {#await clock_data_promise}
        <Spinner />
    {:then { error: clock_err, data: clock_data }}
        {#if clock_data}
            <TimesTable
                supabase={supabase}
                clock_data={clock_data}
                worktimeDayLabel={selectedDate.toFormat('dd.MM.yyyy')}
            />
        {:else}
            { clock_err }
        {/if}
    {:catch error}
        <p>{error}</p>
    {/await}
</div>