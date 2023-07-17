<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	import { toastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	export let data;
	let { supabase } = data;

	let newPassword: string = '';
	let newPasswordRepeat: string = '';
	let errorMessage: string | undefined;
	const handleUpdatePw = async () => {
		const res = await supabase.auth.updateUser({ password: newPassword });
		errorMessage = res.error?.message;
		if (res.data.user) {

			const t: ToastSettings = {
				message: 'Password updated',
				timeout: 2000,
                background: "variant-filled-success"
			};
			toastStore.trigger(t);
			goto('/app');
		}
	};
	$: checkPwValid = () => {
		if (newPassword !== newPasswordRepeat || newPassword.length > 1) {
			return false;
		}
		return true;
	};
</script>

<div class="flex flex-col items-center justify-center mt-5">
	<form id="reset-pw" class="text-center" on:submit={handleUpdatePw}>
		<label class="label text-start" for="Passwort">
			<span>New password</span>
			<input
				class="input mt-3 {errorMessage ? 'input-error' : ''}"
				title="New password"
				type="password"
				placeholder=""
				bind:value={newPassword}
			/>
		</label>
		<label class="label text-start" for="Passwort">
			<span>Reapeat new password</span>
			<input
				class="input mt-3 {errorMessage ? 'input-error' : ''}"
				title="Reapeat new password"
				type="password"
				placeholder=""
				bind:value={newPasswordRepeat}
			/>
		</label>
		<button type="submit" class="btn variant-filled-surface mt-3" disabled={checkPwValid()}>
			Update password
		</button>
	</form>
	{#if errorMessage}
		<br />
		<div class="text-red-600" transition:fade>
			{errorMessage}
			<button class="btn btn-sm" on:click={() => (errorMessage = undefined)}>X</button>
		</div>
	{/if}
</div>
