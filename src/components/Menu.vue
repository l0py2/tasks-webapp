<template>
	<header>
		<nav>
			<p id="logo"><LogoText/></p>
			<button id="dropdown" :class="{ selected: show.menu }" @click="show.menu = !show.menu"><span class="material-symbols-outlined">menu</span> Toggle menu</button>
			<ul v-show="show.menu">
				<RouterLink to="/"><li>About</li></RouterLink>
				<template v-if="!store.token">
				<RouterLink to="/login"><li class="important">Login</li></RouterLink>
				<RouterLink to="/register"><li class="important">Register</li></RouterLink>
				</template>
				<template v-else>
				<RouterLink to="/groups"><li>My groups</li></RouterLink>
				<RouterLink to="/tasks"><li>My tasks</li></RouterLink>
				<li @click="logout" class="sel important">Logout</li>
				</template>
			</ul>
		</nav>
	</header>
</template>

<style scoped>
@import '@/assets/styles/menu.css';
</style>

<script>
import LogoText from '@/components/LogoText.vue';
import { useUserStore } from '@/stores/user';

export default {
	components: {
		LogoText
	},
	setup() {
		const store = useUserStore();

		return { store };
	},
	data() {
		return {
			show: {
				menu: true
			}
		};
	},
	methods: {
		logout() {
			localStorage.removeItem('token');
			this.store.$reset();
			this.$router.replace('/login');
		}
	}
}
</script>
