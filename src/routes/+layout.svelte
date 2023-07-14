<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-crimson.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell, AppBar, AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
	const handleSignOut = async () => {
		await supabase.auth.signOut();
		await invalidateAll();
	};
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Clock INN'</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#if !data.session}
					<a class="btn btn-sm variant-ghost-surface" href="/login" rel="noreferrer"> Login </a>
				{:else}
					<button class="btn btn-sm variant-ghost-surface" on:click={handleSignOut}>
						Logout
					</button>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		{#if $page.data.session && $page.url.pathname.startsWith('/app')}
			<AppRail>
				<svelte:fragment slot="lead">
					<AppRailAnchor href="/app" selected={$page.url.pathname === '/app'}>(icon)</AppRailAnchor>
				</svelte:fragment>
				<!-- --- -->
				<AppRailAnchor href="/app/clock" selected={$page.url.pathname === '/app/clock'}>
					(icon)
				</AppRailAnchor>
				<!-- --- -->
				<svelte:fragment slot="trail">
					<AppRailAnchor
						href="/app/account"
						selected={$page.url.pathname === '/app/account'}
						title="Account"
						>(icon)
					</AppRailAnchor>
				</svelte:fragment>
			</AppRail>
		{/if}
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
