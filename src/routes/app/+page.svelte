<!-- src/routes/account/+page.svelte -->
<script lang="ts">
	export let data;

	let { session, supabase, profile } = data
	$: ({ session, supabase, profile } = data)
</script>

<div class="flex items-center justify-center">
    {#if profile?.full_name}
         <h1 class="mt-3">
             Profil von {profile.full_name}
         </h1>
    {/if}
</div>
