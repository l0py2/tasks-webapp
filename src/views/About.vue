<template>
	<Menu/>
	<main>
		<h1><LogoText/> - About</h1>
		<section class="full-flex">
			<p id="slogan"><LogoText/> tasks made simple</p>
		</section>
		<section id="features">
			<div class="card">
				<h2>Simplicity</h2>
				<p><LogoText/> is a simple task manager to manage simple or complex tasks.</p>
				<img src="@/assets/images/undraw-task.svg">
			</div>
			<div class="card">
				<h2>Cooperation</h2>
				<p><LogoText/> allow you to work in a team.</p>
				<img src="@/assets/images/undraw-coop-task.svg">
			</div>
			<div class="card">
				<h2>It is free!</h2>
				<p><LogoText/> is open source. The soure code is available at a GitHub <a href="https://github.com/LfPi2/tasks-webapp" target="_blank">repository</a>.</p>
				<img src="@/assets/images/undraw-free.svg">
			</div>
		</section>
	</main>
</template>

<style scoped>
#slogan {
	padding: 80px;
	width: 100%;
	font-size: 4rem;
	text-align: center;
}

#features {
	display: flex;
	width: 100%;
	flex-direction: row;
	justify-content: space-evenly;
	align-items: stretch;
}

#features > div {
	width: 33%;
	justify-content: top;
}

div.card > img {
	width: 80%;
}

@media screen and (max-width: 800px) {
	#slogan {
		padding: 20px;
		font-size: 2rem;
	}

	#features {
		flex-direction: column;
	}

	#features > div {
		width: 100%;
	}
}
</style>

<script>
import Menu from '@/components/Menu.vue';
import LogoText from '@/components/LogoText.vue';

export default {
	components: {
		Menu,
		LogoText
	},
	setup() {
		document.title = 'Task[\'s\'] - About';
	}
}
</script>
