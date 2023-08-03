<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import type { Database } from "../../../types/supabase";
	import type { ClockDataSuccess } from "$lib/db/timeTable";
    import { formatDate } from "$lib/helpers/timeHelpers"
	import { DateTime, Duration } from "luxon";
	import { modalStore, type ModalComponent, type ModalSettings, type PopupSettings, popup, ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
	import DeleteTime from "$lib/app/clock/DeleteTime.svelte";
	import ThreeDots from "$lib/icons/ThreeDots.svelte";

    export let supabase: SupabaseClient<Database>;
    // TODO: remove once used 
    // supress annoying warning
    $: supabase;
    export let clock_data: Exclude<ClockDataSuccess, null>;
    export let worktimeDayLabel: string = 'Today';

    const calculateTotalTime = () => {
        let time: Duration = Duration.fromMillis(0);
        if (!clock_data) return time;
        for (const entry of clock_data) {
            const clock_out = entry.clock_out ? DateTime.fromISO(entry.clock_out) : DateTime.now()
            const diff = clock_out.diff(DateTime.fromISO(entry.clock_in))
            time = time.plus(diff);
        }
        return time.toFormat('hh:mm:ss');
        // return msToHMS(time);
    }

    $: totalTime = calculateTotalTime();
    setInterval(() => {
        totalTime = calculateTotalTime();
    }, 1000);

    const createDeleteModal = (idToDelete: string) => {
        const modalComponent: ModalComponent = {
            // Pass a reference to your custom component
            ref: DeleteTime,
            // Add the component properties as key/value pairs
            props: { supabase: supabase, entryToDelete: idToDelete },
            // Provide a template literal for the default component slot
            // slot: '<p>Skeleton</p>'
        };
        return {
            type: 'component',
            component: modalComponent
        } satisfies ModalSettings;
    }

    let dropdownValue: string = 'choose_action'

    // hack in order to prevent werid coloring
    $: {
        if (dropdownValue) {
            dropdownValue = 'choose_action'
        }
    }
    const popupCombobox: PopupSettings = {
        event: 'focus-click',
        target: 'popupCombobox',
        placement: 'bottom',
        closeQuery: '.listbox-item'
    };
</script>

<div class="table-container lg:w-1/2 lg:px-0 sm:px-5">
    <!-- Native Table Element -->
    <table class="table table-hover">
        <thead>
            <tr>
                <th>From</th>
                <th>To</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each clock_data as time}
                <tr>
                    <td>
                        <span class="text-base md:me-3">{ formatDate(time.clock_in) }</span>
                        <!-- <button on:click={() => modalStore.trigger(modal)} class="btn variant-ghost-surface">Edit</button> -->
                    </td>
                    {#if time.clock_out}
                        <td>
                        <span class="text-base me-3">{ formatDate(time.clock_out) }</span>
                        </td>
                    <!-- <button class="btn variant-ghost-surface">Edit</button> -->
                    {:else}
                        <td class="italic">No time set</td>
                    {/if}
                    <td>
                        <button class="justify-between" use:popup={popupCombobox}>
                            <ThreeDots />
                        </button>
                        <div class="card w-24 shadow-xl py-2 text-center rounded-lg" data-popup="popupCombobox">
                            <ListBox rounded="rounded-none">
                                <ListBoxItem bind:group={dropdownValue} name="medium" value="edit"
                                            on:click={() => null}>
                                    <div class="font-bold">
                                        Edit
                                    </div>
                                </ListBoxItem>
                                <ListBoxItem bind:group={dropdownValue} name="medium" value="delete"
                                            on:click={() => modalStore.trigger(createDeleteModal(time.id))}>
                                    <div class="font-bold text-red-600">
                                        Delete
                                    </div>
                                </ListBoxItem>
                            </ListBox>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
        <tfoot>
            <tr>
                <th colspan="3">Worktime for {worktimeDayLabel}: {totalTime}</th>
            </tr>
        </tfoot>
    </table>
</div>