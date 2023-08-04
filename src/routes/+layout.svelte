<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-crimson.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		AppRail,
		AppRailAnchor,
		LightSwitch,
		Toast,
		TabGroup,
		TabAnchor,
		Modal
	} from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import HomeIcon from '$lib/icons/HomeIcon.svelte';
	import ClockIcon from '$lib/icons/ClockIcon.svelte';
	import UserIcon from '$lib/icons/UserIcon.svelte';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { pwaInfo } from 'virtual:pwa-info';
    import { dev } from '$app/environment';
    import { inject } from '@vercel/analytics';
    
    // enables vercel analytics
    inject({ mode: dev ? 'development' : 'production' });

	export let data;

	let { supabase, session, profile } = data;
	$: ({ supabase, session, profile } = data);

	$: webManifestLink = pwaInfo ? (pwaInfo.webManifest.linkTag as string) : '';

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
	onMount(async () => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		if (pwaInfo) {
			const { useRegisterSW } = await import('virtual:pwa-register/svelte');
			useRegisterSW({
				immediate: true,
				onRegistered(r) {
					// uncomment following code if you want check for updates
					r && setInterval(() => {
					   // console.log('Checking for sw update')
					   r.update()
					}, 200000 /* 200s for testing purposes */)
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error) {
					console.log('SW registration error', error);
				}
			});
		}

		return () => data.subscription.unsubscribe();
	});
	const handleSignOut = async () => {
		await supabase.auth.signOut();
		await invalidateAll();
	};
</script>

<svelte:head>
	{@html webManifestLink}
    <meta name="theme-color" content="#15171f" media="(prefers-color-scheme: dark)">
    <meta name="theme-color" content="#dfe0e2" media="(prefers-color-scheme: light)">
</svelte:head>

<!-- Modals -->
<Modal />

<!-- Toast -->
<Toast position="tr" />

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/"><strong class="text-xl uppercase">Clock it!</strong></a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#if profile?.username}
					<span>Logged in as: {profile.username}</span>
				{/if}
				{#if !data.session}
					<a class="btn btn-sm variant-ghost-surface" href="/login" rel="noreferrer"> Login </a>
				{:else}
					{#if !$page.url.pathname.startsWith('/app')}
						<a class="btn btn-sm variant-ghost-surface" href="/app"> To the app </a>
					{/if}
					<button class="btn btn-sm variant-ghost-surface" on:click={handleSignOut}>
						Logout
					</button>
				{/if}
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		{#if $page.data.session && $page.url.pathname.startsWith('/app')}
			<div class="hidden md:contents">
				<AppRail>
					<svelte:fragment slot="lead">
						<AppRailAnchor href="/app" selected={$page.url.pathname === '/app'}>
							<svelte:fragment slot="lead">
								<HomeIcon />
							</svelte:fragment>
							Home
						</AppRailAnchor>
					</svelte:fragment>
					<!-- --- -->
					<AppRailAnchor href="/app/clock" selected={$page.url.pathname === '/app/clock'}>
						<svelte:fragment slot="lead">
							<ClockIcon />
						</svelte:fragment>
						Clock
					</AppRailAnchor>
					<!-- --- -->
					<svelte:fragment slot="trail">
						<AppRailAnchor
							href="/app/account"
							selected={$page.url.pathname === '/app/account'}
							title="Account"
						>
							<svelte:fragment slot="lead">
								<UserIcon />
							</svelte:fragment>
							Account
						</AppRailAnchor>
					</svelte:fragment>
				</AppRail>
			</div>
		{/if}
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
	<svelte:fragment slot="footer">
		{#if $page.data.session && $page.url.pathname.startsWith('/app')}
			<div class="contents md:hidden text-center">
				<TabGroup
					justify="justify-center"
					active="variant-filled-primary"
					hover="hover:variant-soft-primary"
					flex="flex-1 lg:flex-none"
					rounded=""
					border=""
					class="bg-surface-100-800-token w-full"
				>
					<TabAnchor href="/app" selected={$page.url.pathname === '/app'}>
						<svelte:fragment slot="lead">
							<div class="flex justify-center align-middle">
								<HomeIcon />
							</div>
						</svelte:fragment>
						<span>Home</span>
					</TabAnchor>
					<TabAnchor href="/app/clock" selected={$page.url.pathname === '/app/clock'}>
						<svelte:fragment slot="lead">
							<div class="flex justify-center align-middle">
								<ClockIcon />
							</div>
						</svelte:fragment>
						<span>Clock</span>
					</TabAnchor>
					<TabAnchor href="/app/account" selected={$page.url.pathname === '/app/account'}>
						<svelte:fragment slot="lead">
							<div class="flex justify-center align-middle">
								<UserIcon />
							</div>
						</svelte:fragment>
						<span>Account</span>
					</TabAnchor>
				</TabGroup>
			</div>
		{/if}
	</svelte:fragment>
</AppShell>
