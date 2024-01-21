<template>
	<div v-if="show" class="full-container">
		<section class="card">
			<h1><slot name="title">Task['s']</slot></h1>
			<p><slot name="body"></slot></p>
			<button @click="$emit('close')">Close</button>
		</section>
	</div>
</template>

<style scoped>
section {
	width: 40vw;
	border: 2px solid var(--sel-color);
}

button {
	margin-top: 20px;
}
</style>

<script>
export default {
	props: ['show'],
	emits: ['close']
}
</script>
