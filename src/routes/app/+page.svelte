<!-- src/routes/account/+page.svelte -->
<script	async script lang="ts">
	import { page } from '$app/stores';
	import Clock from '$lib/app/clock/Clock.svelte';
	import Inbox from '$lib/icons/Inbox.svelte';
	import Out from '$lib/icons/Out.svelte';
	import { modalStore, toastStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import type { ActionData } from './$types.js';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/icons/Spinner.svelte';

	export let data;

    export let form: ActionData;

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('de-DE', {timeStyle: 'short', dateStyle: 'medium'});
    }

	// let { session, supabase, profile, clock_data, clock_err } = data
	$: ({ session, supabase, profile, clock_data, clock_err } = data)

    let loadingClocks = false;
    let loadingClockIn = false;
    let loadingClockOut = false;

    const makeSuccessToast = (msg?: string): ToastSettings => {
        return {
            message: msg ?? 'Success',
            // Provide any utility or variant background style:
            background: 'variant-filled-success'
        };
    };
    const makeErrorToast = (msg?: string): ToastSettings => {
        return {
            message: msg ?? 'Error',
            // Provide any utility or variant background style:
            background: 'variant-filled-error'
        };
    };

    function pad(nb: number) {
        return Math.floor(nb).toString().padStart(2, '0');
    }

    function msToHMS(ms: number) {
        // 1- Convert to seconds:
        let seconds = ms / 1000;
        // 2- Extract hours:
        const hours = seconds / 3600; // 3,600 seconds in 1 hour
        seconds = seconds % 3600; // seconds remaining after extracting hours
        // 3- Extract minutes:
        const minutes = seconds / 60; // 60 seconds in 1 minute
        // 4- Keep only seconds not extracted to minutes:
        seconds = seconds % 60;
        return pad(hours)+":"+pad(minutes)+":"+pad(seconds);
    }

    const calculateTotalTime = () => {
        let time: number = 0;
        if (!clock_data) return time;
        for (const entry of clock_data) {
            const diff = new Date(entry.clock_out ?? Date.now()).getTime() - new Date(entry.clock_in).getTime();
            time += diff;
        }
        return msToHMS(time);
    }

    $: totalTime = calculateTotalTime();
    setInterval(() => {
        totalTime = calculateTotalTime();
    }, 1000);
</script>

<div class="flex flex-col gap-y-4 items-center justify-center">
    <Clock clockSize="x-large"/>
    <div class="flex gap-x-5">
        <form method="POST" action="?/clock_in" use:enhance={() => {
            loadingClocks = true;
            loadingClockIn = true;
            return async ({ update, result }) => {
                await update();
                // switch (result.type) {
                //     case 'success':
                //         toastStore.trigger(makeSuccessToast())
                //         break;

                //     case 'error' || 'failure':
                //         toastStore.trigger(makeErrorToast())
                //         break;
                
                //     default:
                //         break;
                // }
                loadingClocks = false;
                loadingClockIn = false;
            }
        }}>
            <button class="btn variant-filled {loadingClocks ? 'opacity-50 pointer-events-none' : ''}">
                {#if loadingClockIn}
                    <span><Spinner /></span>
                {:else}
                     <span><Inbox /></span>
                {/if}
                <span>Clock in</span>
            </button>
        </form>
        <form method="POST" action="?/clock_out" use:enhance={() => {
            loadingClocks = true;
            loadingClockOut = true;
            return async ({ update, result, formData }) => {
                // switch (result.type) {
                //     case 'success':
                //         toastStore.trigger(makeSuccessToast())
                //         break;

                //     case 'error' || 'failure':
                //         toastStore.trigger(makeErrorToast())
                //         break;
                
                //     default:
                //         break;
                // }
                await update();
                loadingClocks = false;
                loadingClockOut = false;
            }
        }}>
            <button class="btn variant-filled {loadingClocks ? 'opacity-50 pointer-events-none' : ''}">
                {#if loadingClockOut}
                    <span><Spinner /></span>
                {:else}
                     <span><Out /></span>
                {/if}
                <span>Clock out</span>
            </button>
        </form>
    </div>
    {#if form?.clock_status === 'success'}
        <p class="text-green-600">{form.message}</p>
    {/if}
    {#if form?.clock_status === 'error'}
        <p class="text-red-600">{form.message}</p>
    {/if}
    {#if clock_err}
        <div>{clock_err.message}</div>
    {:else if !clock_data || clock_data.length === 0}
        <div>no data</div>
    {:else}
        <div class="table-container lg:w-1/2 lg:px-0 sm:px-5">
            <!-- Native Table Element -->
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                    </tr>
                </thead>
                <tbody>
                    {#each clock_data as time}
                        <tr>
                            {#if time.clock_in}
                                <td>
                                    <span class="text-base md:me-3">{formatDate(time.clock_in)}</span>
                                    <!-- <button on:click={() => modalStore.trigger(modal)} class="btn variant-ghost-surface">Edit</button> -->
                                </td>
                            {:else}
                                <td class="italic">No time set</td>
                            {/if}
                            {#if time.clock_out}
                                <td>
                                    <span class="text-base me-3">{formatDate(time.clock_out)}</span>
                                </td>
                            <!-- <button class="btn variant-ghost-surface">Edit</button> -->
                            {:else}
                                <td class="italic">No time set</td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="3">Worktime Today: {totalTime}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    {/if}
    <!-- {#if profile?.full_name}
         <h1 class="mt-3">
             Profil von {profile.full_name}
         </h1>
    {/if} -->
</div>
