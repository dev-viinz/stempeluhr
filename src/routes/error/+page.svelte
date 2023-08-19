<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { ErrorCodes, getUserErrorMessage } from "$lib/constants/ErrorCodes";

    let errCode = $page.url.searchParams.get('errCode') || '0'
    let err = getUserErrorMessage(parseInt(errCode))
</script>
<div class="flex flex-col gap-y-4 items-center justify-center h-2/3 text-center">
    <h2 class="text-4xl">{err.title}</h2>
    <p class="text-lg whitespace-pre-line">{err.message}</p>
    {#if err.goto && err.gotoTitle}
         <a class="btn variant-filled-secondary" href="{err.goto}">
             {err.gotoTitle}
         </a>
    {/if}
</div>