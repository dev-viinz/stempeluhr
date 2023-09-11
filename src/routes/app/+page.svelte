<!-- src/routes/account/+page.svelte -->
<script	async script lang="ts">
	import { page } from '$app/stores';
	import Clock from '$lib/app/clock/Clock.svelte';
	import Inbox from '$lib/icons/Inbox.svelte';
	import Out from '$lib/icons/Out.svelte';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ToastSettings } from '@skeletonlabs/skeleton';
	import type { ActionData } from './$types.js';
	import { enhance } from '$app/forms';
	import Spinner from '$lib/icons/Spinner.svelte';
	import TimesTable from '$lib/app/clock/TimesTable.svelte';
	import { getClocksForDate } from '$lib/db/timeTable';
	import { DateTime } from 'luxon';

	export let data;

    export let form: ActionData;

    const modalStore = getModalStore();
    const toastStore = getToastStore();

	// let { session, supabase, profile, clock_data, clock_err } = data
	$: ({ session, supabase, profile } = data)
    $: clock_data_promise = getClocksForDate(supabase, DateTime.now())

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
    {#await clock_data_promise}
    <!-- TODO: make an actual placeholder table so it doesn't look this bad?? -->
        <Spinner />
    {:then { error: clock_err, data: clock_data }}
        {#if clock_data}
            <TimesTable
                supabase={supabase}
                clock_data={clock_data}
            />
        {:else}
            { clock_err }
        {/if}
    {:catch error}
        <p>{error}</p>
    {/await}
    <!-- {#if profile?.full_name}
         <h1 class="mt-3">
             Profil von {profile.full_name}
         </h1>
    {/if} -->
</div>
