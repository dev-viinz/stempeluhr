<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import type { Database } from "../../../types/supabase";
	import type { ClockDataSuccess } from "$lib/db/timeTable";
    import { formatDate } from "$lib/helpers/timeHelpers"
	import { DateTime, Duration } from "luxon";
	import { getModalStore, type ModalComponent, type ModalSettings, type PopupSettings, popup, ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
	import DeleteTime from "$lib/app/clock/DeleteTime.svelte";
	import ThreeDots from "$lib/icons/ThreeDots.svelte";
	import EditTime from "./EditTime.svelte";
    import AddTime from "./AddTime.svelte";
	import Clock from "./Clock.svelte";

    export let supabase: SupabaseClient<Database>;
    export let clock_data: Exclude<ClockDataSuccess, null>;
    export let worktimeDayLabel: string = 'Today';

    $: currentDate = worktimeDayLabel === 'Today' ? DateTime.now() : DateTime.fromFormat(worktimeDayLabel, 'dd.MM.yyyy');

    const modalStore = getModalStore();

    const halfHour = Duration.fromObject({ minutes: 30 });
    const threeQuarterHour = Duration.fromObject({ minutes: 45 });

    const calculatePauseToSubtract = () => {
        if (!totalTime) return Duration.fromISO('00:00:00');
        const actualTime = totalTime;
        if (actualTime.as('hours') < 6) return Duration.fromMillis(0);
        else if (actualTime.as('hours') < 9) return halfHour;
        else return threeQuarterHour;
    }
    
    const calculatePauseAlreadyTaken = () => {
        if (!clock_data) return Duration.fromMillis(0);
        // let pause: Duration = Duration.fromMillis(0);
        let milliPause = 0;
        let lastTimestamp: string | null = null;
        const reversed_clockdata = clock_data.slice().reverse();
        for (const [i, entry] of reversed_clockdata.entries()) {
            if (i == 0) {
                continue;
            } else {
                const diff = DateTime.fromISO(entry.clock_in).diff(DateTime.fromISO(reversed_clockdata[i-1].clock_out!)).normalize();
                milliPause += diff.toMillis();
            }
        }
        return Duration.fromMillis(milliPause);
    }

    const calculateTotalTime = () => {
        let time: Duration = Duration.fromMillis(0);
        if (!clock_data) return time;
        for (const entry of clock_data) {
            const clock_out = entry.clock_out ? DateTime.fromISO(entry.clock_out) : DateTime.now()
            const diff = clock_out.diff(DateTime.fromISO(entry.clock_in))
            time = time.plus(diff);
        }
        return time;
        // return msToHMS(time);
    }

    const calculateTotalTimeWithPause = () => {
        let totalTime = calculateTotalTime();
        const pauseToTake = calculatePauseToSubtract().minus(calculatePauseAlreadyTaken());
        if (pauseToTake.isValid && pauseToTake.toMillis() > 0) {
            totalTime = totalTime.minus(pauseToTake)
        }
        return totalTime;
    }
    
    $: totalTime = calculateTotalTime();
    $: pauseToTake = calculatePauseToSubtract();
    $: pauseTaken = calculatePauseAlreadyTaken();
    $: actualTime = calculateTotalTimeWithPause();

    setInterval(() => {
        totalTime = calculateTotalTime();
        pauseToTake = calculatePauseToSubtract();
        pauseTaken = calculatePauseAlreadyTaken();
        actualTime = calculateTotalTimeWithPause();
    }, 1000);

    const createDeleteModal = (idToDelete: string): ModalSettings => {
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
        };
    }

    const createEditModal = (idToEdit: string): ModalSettings => {
        const modalComponent: ModalComponent = {
            ref: EditTime,
            props: { supabase: supabase, entryToEdit: idToEdit }
        };
        
        const modal: ModalSettings = {
            type: 'component',
            component: modalComponent
        };
        return modal;
    }

    const createAddModal = (date: DateTime): ModalSettings => {
        const modalComponent: ModalComponent = {
            ref: AddTime,
            props: { supabase: supabase, date: date }
        };
        
        const modal: ModalSettings = {
            type: 'component',
            component: modalComponent
        };
        return modal;
    }

    let dropdownValue: string = 'choose_action'

    // hack in order to prevent weird coloring
    $: {
        if (dropdownValue) {
            dropdownValue = 'choose_action'
        }
    }
    const popupCombobox: PopupSettings = {
        event: 'click',
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
            <tr>
                <td colspan="3" class="text-center" style="padding: 0px;">
                    <button class="btn text-3xl w-full" on:click={() => modalStore.trigger(createAddModal(currentDate))}>+</button>
                </td>
            </tr>
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
                        <button class="justify-between" 
                                use:popup={{
                                    event: 'click',
                                    target: `popupCombobox-${time.id}`,
                                    placement: 'bottom',
                                    closeQuery: '.listbox-item'
                                }}>
                            <ThreeDots />
                        </button>
                        <div class="card w-24 shadow-xl py-2 text-center rounded-lg" data-popup="popupCombobox-{time.id}">
                            <ListBox rounded="rounded-none">
                                <ListBoxItem bind:group={dropdownValue} name="medium" value="edit"
                                            on:click={() => modalStore.trigger(createEditModal(time.id))}>
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
                <th>
                    Pause already Taken: {pauseTaken.isValid ? pauseTaken.toFormat('hh:mm:ss') : 'Calculating...'}
                </th>
                <th>
                    Pause to take: {pauseToTake.toFormat('hh:mm:ss')}
                </th>
            </tr>
            <tr>
                <th>Worktime for {worktimeDayLabel}: {totalTime.toFormat('hh:mm:ss')}</th>
                <th>
                    Actual Worktime: {actualTime.toFormat('hh:mm:ss')}
                </th>
            </tr>
        </tfoot>
    </table>
</div>