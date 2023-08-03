<script lang="ts">
	import { DateTime } from "luxon";

    export let clockSize: ClockSize;

	const refreshTime = () => {
        return DateTime.now().toFormat('HH:mm');
	}

    let dateString = refreshTime();

    type ClockSize = | "small" | "medium" | "large" | "x-large"

    const getSize = () => {
        switch (clockSize) {
            case "small": return "text-base"
            case "medium": return "text-2xl"
            case "large": return "text-5xl"
            case "x-large": return "text-9xl"
            
            default: return "text-base"
        }
    }

	setInterval(() => {
        dateString = refreshTime();
    }, 1000);
</script>

{#key dateString}
    <div class="{getSize()} font-bold">
        { dateString }
    </div>
{/key}
