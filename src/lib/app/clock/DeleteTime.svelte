<script lang="ts">
	import type { SupabaseClient } from "@supabase/supabase-js";
	import type { Database } from "../../../types/supabase";
	import { invalidateAll } from "$app/navigation";
	import { getModalStore } from "@skeletonlabs/skeleton";


    export let supabase: SupabaseClient<Database>;
    export let entryToDelete: string;

    // idk
    export let parent: any;
    $: parent;
    const modalStore = getModalStore();

    const deleteEntry = async () => {
        const { error } = await supabase
                        .from('timetable')
                        .delete()
                        .eq('id', entryToDelete)
        // TODO: handle error?
        if (error) {
            console.log(error.message);
        }
        await invalidateAll();
        modalStore.close();
    }
</script>

<slot />
<div class="card text-center">
    <header class="card-header font-bold">Do you really want to delete?</header>
    <!-- <section class="p-4"></section> -->
    <footer class="card-footer mt-3">
        <button class="btn variant-filled-error" on:click={() => deleteEntry()}>
            Yes
        </button>
        <button class="btn variant-filled-surface" on:click={() => modalStore.close()}>
            No
        </button>
    </footer>
</div>
