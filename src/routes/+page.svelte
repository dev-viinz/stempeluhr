<script lang="ts">
    export let data;
</script>

<div class="flex flex-col gap-y-4 items-center justify-center h-2/3">
    <div class="font-semibold text-6xl md:text-7xl lg:text-9xl text-center gradient-heading">
        Clock IT!
    </div>
    {#if !data.session}
        <a class="btn variant-outline-secondary" href="/login">Login</a>
    {:else}
        <a class="btn variant-outline-secondary" href="/app">To the App</a>
    {/if}
</div>