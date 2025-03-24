<script lang="ts">
	import { onMount, tick, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	export let noteKey: string;

	interface Heading {
		id: string;
		text: string;
		level: number;
		// pos is the vertical position (percentage) relative to the content container’s height.
		pos: number;
	}

	interface Segment {
		top: number;
		height: number;
	}

	let headings: Heading[] = [];
	let segments: Segment[] = [];
	const currentId = writable<string>('');
	let observer: IntersectionObserver | null = null;

	// Compute vertical line segments with gaps.
	function computeSegments() {
		segments = [];
		if (headings.length === 0) return;
		const gapPx = 9;
		// Since computeSegments is only called onMount (client-side), window is safe here.
		const viewportHeight = window.innerHeight;
		const gapPercent = (gapPx / viewportHeight) * 100;
		const halfGap = gapPercent / 2;
		const sorted = headings.slice().sort((a, b) => a.pos - b.pos);

		// Segment from top of container to just before the first dot.
		const firstSegmentHeight = sorted[0].pos - halfGap;
		if (firstSegmentHeight > 0) {
			segments.push({ top: 0, height: firstSegmentHeight });
		}

		// Segments between successive dots.
		for (let i = 0; i < sorted.length - 1; i++) {
			const start = sorted[i].pos + halfGap;
			const end = sorted[i + 1].pos - halfGap;
			if (end > start) {
				segments.push({ top: start, height: end - start });
			}
		}

		// Segment from the last dot to the bottom.
		const lastSegmentTop = sorted[sorted.length - 1].pos + halfGap;
		if (lastSegmentTop < 100) {
			segments.push({ top: lastSegmentTop, height: 100 - lastSegmentTop });
		}
	}

	async function updateToC() {
		if (observer) {
			observer.disconnect();
		}
		// Wait for Markdown content to render.
		await tick();

		const content = document.querySelector('.content');
		if (!content) {
			console.warn("Content container '.content' not found");
			return;
		}

		const contentHeight = content.scrollHeight;

		const headingElements = content.querySelectorAll(
			'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'
		);
		headings = Array.from(headingElements).map((el: Element) => {
			const level = parseInt(el.tagName.substring(1));
			const text = el.textContent?.trim() || '';
			const rect = el.getBoundingClientRect();
			const top = rect.top + window.scrollY;
			const pos = (top / contentHeight) * 100;
			return { id: el.getAttribute('id') || '', text, level, pos };
		});

		computeSegments();

		const visibleHeadings = new Map<string, IntersectionObserverEntry>();
		const observerOptions = { rootMargin: '0px 0px -80% 0px' };

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const id = (entry.target as HTMLElement).id;
				if (entry.isIntersecting) {
					visibleHeadings.set(id, entry);
				} else {
					visibleHeadings.delete(id);
				}
			});

			let minEntry: IntersectionObserverEntry | null = null;
			visibleHeadings.forEach((entry) => {
				if (!minEntry || entry.boundingClientRect.top < minEntry.boundingClientRect.top) {
					minEntry = entry;
				}
			});
			if (minEntry) {
				currentId.set((minEntry.target as HTMLElement).id);
			}
		}, observerOptions);

		headingElements.forEach((el) => observer!.observe(el));
	}

	onMount(() => {
		updateToC();
	});

	$: if (noteKey) {
		updateToC();
	}

	onDestroy(() => {
		if (observer) observer.disconnect();
	});

	// Guard window references in reactive declarations so they only run on the client.
	$: viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
	$: gapPx = 9;
	$: gapPercent = viewportHeight > 0 ? (gapPx / viewportHeight) * 100 : 0;
	$: halfGap = gapPercent / 2;
	$: sortedHeadings = headings.slice().sort((a, b) => a.pos - b.pos);
	$: currentIndex = sortedHeadings.findIndex((h) => h.id === $currentId);
</script>

<nav class="relative h-[93svh] w-full">
	<!-- Render gray vertical line segments with gaps -->
	{#each segments as seg}
		<div
			class="absolute right-2 w-0.5 bg-gray-100"
			style="top: {seg.top}%; height: {seg.height}%"
		></div>
	{/each}

	<!-- Render dark gray segments adjacent to the current dot -->
	{#if currentIndex !== -1}
		{#if currentIndex === 0}
			<!-- For the first heading, highlight from the top to the dot -->
			<div
				class="absolute right-2 w-px bg-blue-500"
				style="top: 0%; height: {sortedHeadings[0].pos - halfGap}%"
			></div>
		{:else}
			<!-- For non-first headings, highlight the segment above the current dot -->
			<div
				class="absolute right-2 w-px bg-blue-500"
				style="top: {sortedHeadings[currentIndex - 1].pos + halfGap}%; height: {sortedHeadings[
					currentIndex
				].pos -
					halfGap -
					(sortedHeadings[currentIndex - 1].pos + halfGap)}%"
			></div>
		{/if}

		{#if currentIndex === sortedHeadings.length - 1}
			<!-- For the last heading, highlight from the dot to the bottom -->
			<div
				class="absolute right-2 w-px bg-blue-500"
				style="top: {sortedHeadings[currentIndex].pos + halfGap}%; height: {100 -
					(sortedHeadings[currentIndex].pos + halfGap)}%"
			></div>
		{:else}
			<!-- For non-last headings, highlight the segment below the current dot -->
			<div
				class="absolute right-2 w-px bg-blue-500"
				style="top: {sortedHeadings[currentIndex].pos + halfGap}%; height: {sortedHeadings[
					currentIndex + 1
				].pos -
					halfGap -
					(sortedHeadings[currentIndex].pos + halfGap)}%"
			></div>
		{/if}
	{/if}

	<!-- Render headings and their corresponding dots -->
	{#each headings as heading}
		<a
			href={'#' + heading.id}
			class={`absolute no-underline ${$currentId === heading.id ? 'text-blue-500' : 'text-gray-300'}`}
			style="top: {heading.pos}%; left: {(heading.level - 1) * 20}px; transform: translateY(-50%);"
		>
			{heading.text}
		</a>
		<span
			class={`absolute rounded-full ${$currentId === heading.id ? 'bg-blue-500' : 'bg-gray-300'}`}
			style="height: 0.2rem; width: 0.2rem; top: {heading.pos}%; right: 7.5px; transform: translateY(-50%);"
		></span>
	{/each}
</nav>

<style>
	/* Hide heading text by default */
	nav a {
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	/* Show heading text on mouse hover over the ToC area */
	nav:hover a {
		opacity: 1;
	}
</style>
