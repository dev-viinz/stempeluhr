<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	export let data;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let errorMessage: string | undefined;

	let email: string;
	let password: string;

	const handleSignIn = async () => {
		const response = await supabase.auth.signInWithPassword({
			email,
			password
		});
		if (response.data.session) {
			goto('/app');
		} else {
			errorMessage = response.error?.message;
		}
	};
</script>

<div class="flex flex-col items-center justify-center mt-5">
	<form id="login-form" class="text-center" on:submit={handleSignIn}>
		<!-- <input name="email" bind:value={email} /> -->
		<label class="label text-start" for="E-Mail">
			<span>E-Mail</span>
			<input
				class="input {errorMessage ? 'input-error' : ''}"
				title="E-Mail"
				type="text"
				placeholder="name@example.com"
				bind:value={email}
			/>
		</label>
        <label class="label text-start" for="Passwort">
            <span>Password</span>
            <input
                class="input mt-3 {errorMessage ? 'input-error' : ''}"
                title="Passwort"
                type="password"
                placeholder=""
                bind:value={password}
            />
        </label>
		<button type="submit" class="btn variant-filled-surface mt-3 me-2">
			Sign in
		</button>
        <a href="/forgot-password">
            Forgot password?
        </a>
	</form>
    {#if errorMessage}
    <br>
        <div class="text-red-600" transition:fade>
            {errorMessage} <button class="btn btn-sm" on:click={() => (errorMessage = undefined)}>X</button>
        </div>
    {/if}
</div>
