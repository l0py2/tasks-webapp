<template>
	<RouterView v-if="request.test && request.auth"/>
	<main v-else-if="request.auth">
		<h1>The Task['s'] API is down so the Task['s'] web application cannot work properly</h1>
		<h2>Sorry for the inconvinience</h2>
	</main>
</template>

<script>
import { RouterView } from 'vue-router';

import axios from '@/modules/api';
import { useUserStore } from '@/stores/user';
import { updateToken } from '@/modules/auth';

export default {
	components: {
		RouterView
	},
	setup() {
		const store = useUserStore();

		return { store };
	},
	data() {
		return {
			request: {
				auth: false,
				test: false
			}
		};
	},
	async created() {
		try {
			await axios.request({
				url: '/',
				method: 'get'
			});
			this.request.test = true;
		}catch(error) {}

		const tokenParts = await updateToken();

		if(tokenParts) {
			this.store.token = tokenParts.token;
			this.store.username = tokenParts.payload.username;
		}else {
			localStorage.removeItem('token');
			this.store.$reset();
		}

		this.request.auth = true;
	}
}
</script>
