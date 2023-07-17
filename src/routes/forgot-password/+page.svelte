<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

    export let data;

    let errorMessage: string | undefined = undefined;
    let successMessage: boolean = false;
    let email: string;

    const handleResetPw = async () => {
        successMessage = false;
        const response = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: $page.url.origin + '/auth/callback?next=/app/update-password'
        });
        if (response.data) {
            successMessage = true;
        } else {
            errorMessage = response.error?.message;
        }
    }

    let { supabase } = data;
    $: ({ supabase } = data);
</script>

<div class="flex flex-col items-center justify-center mt-5">
    <form id="reset-pw" class="text-center" on:submit={handleResetPw}>
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
        <button type="submit" class="btn variant-filled-surface mt-3 me-3">
            Reset password
        </button>
        <a href="/login">
            Back to login
        </a>
    </form>
    {#if errorMessage}
    <br>
        <div class="text-red-600" transition:fade>
            {errorMessage} <button class="btn btn-sm" on:click={() => (errorMessage = undefined)}>X</button>
        </div>
    {/if}
    {#if successMessage}
    <br>
        <div class="text-green-600" transition:fade>
            We've sent you an email if you have an account! <button class="btn btn-sm" on:click={() => (successMessage = false)}>X</button>
        </div>
    {/if}
</div>