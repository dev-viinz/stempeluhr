<script lang="ts">
	import { draw, fly, scale } from "svelte/transition";

    export let clockSize: ClockSize;

	const refreshTime = () => {
        const date = new Date();
        return {
            hours: date.getHours().toString().padStart(2, '0'),
            minutes: date.getMinutes().toString().padStart(2, '0'),
            seconds: date.getSeconds().toString().padStart(2, '0')
        }
		// return new Date().toLocaleTimeString(undefined, {hour: "2-digit", minute:"2-digit", second:"2-digit"});
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
        {dateString.hours}:{dateString.minutes}
    </div>
{/key}
