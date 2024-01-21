<template>
	<main>
		<section>
			<RouterLink to="/" class="back"><p class="back">Go back</p></RouterLink>
			<h1><LogoText/> - Login</h1>
			<form @submit.prevent="login">
				<div>
					<label for="username">Username</label>
					<input v-model="auth.username.data" id="username"/>
				</div>
				<div>
					<label for="password">Password</label>
					<input v-model="auth.password.data" id="password" :type="auth.password.show ? 'text' : 'password'"/>
				</div>
				<div class="show">
					<label for="show-password">Show password:</label>
					<input v-model="auth.password.show" id="show-password" type="checkbox"/>
				</div>
				<p v-for="warning in warnings" class="warning">{{ warning }}</p>
				<button :disabled="!(auth.username.valid && auth.password.valid)">Login</button>
			</form>
			<p>You do not have an account yet? <RouterLink to="/register">Register</RouterLink></p>
		</section>
	</main>
	<Modal :show="show.modal" @close="show.modal = false">
		<template #title>Authentication error</template>
		<template #body>Username or password incorrect</template>
	</Modal>
</template>

<style scoped>
@import '@/assets/styles/auth.css';
</style>

<script>
import LogoText from '@/components/LogoText.vue';
import Modal from '@/components/Modal.vue';
import { useUserStore } from '@/stores/user';
import axios from '@/modules/api';
import { extractToken, validName } from '@/modules/auth';

export default {
	components: {
		LogoText,
		Modal
	},
	setup() {
		document.title = 'Task[\'s\'] - Login';

		const store = useUserStore();

		return { store };
	},
	created() {
		if(this.store.token) {
			this.$router.replace('/');
		}
	},
	data() {
		return {
			show: {
				modal: false
			},
			auth: {
				username: {
					valid: false,
					data: ''
				},
				password: {
					valid: false,
					show: false,
					data: ''
				}
			}
		}
	},
	computed: {
		warnings() {
			const warnings = [];
			const username = this.auth.username.data;
			const password = this.auth.password.data;

			if(username == null || username == '' || password == null || password == '') {
				return warnings;
			}

			if(!validName.test(username)) {
				warnings.push('Invalid username. Valid username must contain only this characters: a-z, A-Z, 0-9, _ and -');
			}

			if(username.length > 64) {
				warnings.push('The username cannot be longer than 64 characters');
			}

			if(password.length < 4 || password.length > 128) {
				warnings.push('The password cannot be shorter than 4 and longer than 128 characters');
			}

			return warnings;
		}
	},
	methods: {
		async login() {
			try {
				const request = await axios.request({
					url: '/login',
					method: 'post',
					data: {
						username: this.auth.username.data,
						password: this.auth.password.data
					}
				});

				const token = request.data.token;

				localStorage.setItem('token', token);

				const tokenParts = await extractToken(token);
				this.store.token = token;
				this.store.username = tokenParts.payload.username;

				this.$router.replace('/');
			}catch(error) {
				this.show.modal = true;
			}
		}
	},
	watch: {
		'auth.username.data'(newValue, oldValue) {
			if(typeof newValue != 'string' || !validName.test(newValue) || newValue.length > 64) {
				this.auth.username.valid = false;
			}else {
				this.auth.username.valid = true;
			}
		},
		'auth.password.data'(newValue, oldValue) {
			if(typeof newValue != 'string' || newValue.length < 4 || newValue.length > 128) {
				this.auth.password.valid = false;
			}else {
				this.auth.password.valid = true;
			}
		}
	}
}
</script>
