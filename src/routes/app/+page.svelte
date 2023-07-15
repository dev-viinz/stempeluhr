<!-- src/routes/account/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import Clock from '$lib/app/clock/Clock.svelte';
	import Inbox from '$lib/icons/Inbox.svelte';
	import Out from '$lib/icons/Out.svelte';

	export let data;

	let { session, supabase, profile } = data
	$: ({ session, supabase, profile } = data)
</script>

<div class="flex flex-col gap-y-4 items-center justify-center">
    <Clock clockSize="x-large"/>
    <div class="flex gap-x-5">
        <button class="btn variant-filled">
            <span><Inbox /></span>
            <span>Clock in</span>
        </button>
        <button class="btn variant-filled">
            <span><Out /></span>
            <span>Clock out</span>
        </button>
    </div>
    <!-- {#if profile?.full_name}
         <h1 class="mt-3">
             Profil von {profile.full_name}
         </h1>
    {/if} -->
</div>
