<template>
	<Menu/>
	<main v-if="request.task">
		<h1><LogoText/> - Task {{ task.name }}</h1>

		<template v-if="role == 0">

		<h2 class="sel" @click="show.add.user = !show.add.user">Add user to task</h2>
		<template v-if="show.add.user">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="search-invite">Search</label>
				<input id="search-invite" type="text" v-model="filter.invites.search"/>
			</div>
		</form>
		<template v-if="request.invites">
		<div class="pagination">
			<p class="sel" v-if="pagination.invites.page > 1" @click="pagination.invites.page--">Previous</p>
			<p v-else>Previous</p>
			<input v-model="pagination.invites.page" type="number" min="1" :max="pagination.invites.maxPages"/>
			<p class="sel" v-if="pagination.invites.page < pagination.invites.maxPages" @click="pagination.invites.page++">Next</p>
			<p v-else>Next</p>
		</div>
		<table v-if="invites.length > 0">
			<tr>
				<th>Username</th>
				<th><span class="material-symbols-outlined">list</span> Actions</th>
			</tr>
			<tr v-for="invite in invites">
				<td>{{ invite.username }}</td>
				<td><button @click="addUser(invite.username)">Add</button></td>
			</tr>
		</table>
		</template>
		</template>

		<button v-if="show.edit" @click="update(); show.edit = false;" :disabled="!validTask">Done</button>
		<button v-else @click="show.edit = true">Edit</button>

		</template>

		<template v-if="show.edit">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="description">Description</label>
				<textarea v-model="task.description" id="description"></textarea>
			</div>
			<div>
				<label for="done">Mark as done: </label>
				<input type="checkbox" v-model="task.status"/>
			</div>
			<div>
				<label for="start">Start date</label>
				<input type="datetime-local" v-model="task.start"/>
			</div>
			<div>
				<label for="end">End date</label>
				<input type="datetime-local" v-model="task.end"/>
			</div>
		</form>
		</template>
		<template v-else>

		<button v-if="own" @click="changeStatus">{{ task.status ? 'Mark as not done' : 'Mark as done' }}</button>

		<h2>Description</h2>
		<pre>{{ task.description }}</pre>
		<h2>Task completition status</h2>
		<p>{{ task.status ? 'Task was finished.' : 'Task was not finished.' }}</p>
		<h2>Task date and time info</h2>
		<p v-if="statusDate" class="warning">End date already reached but task is still to be finished.</p>
		<table>
			<tr>
				<th>Start</th>
				<th :class="{ warning: statusDate }">End</th>
			</tr>
			<tr>
				<td>{{ startDateString }}</td>
				<td :class="{ warning: statusDate }">{{ endDateString }}</td>
			</tr>
		</table>

		</template>
	</main>
</template>

<script>
import Menu from '@/components/Menu.vue';
import LogoText from '@/components/LogoText.vue';
import { useUserStore } from '@/stores/user';
import axios from '@/modules/api';

export default {
	components: {
		Menu,
		LogoText
	},
	setup() {
		const store = useUserStore();

		return { store };
	},
	async created() {
		if(!this.store.token) {
			this.$router.replace('/');
			return;
		}

		await this.get();
		await this.getInvites();

		document.title = `Task['s'] - Task ${this.task.id}`;
	},
	data() {
		return {
			request: {
				task: false,
				invites: false
			},
			show: {
				edit: false,
				add: {
					user: false
				}
			},
			filter: {
				invites: { search: null }
			},
			pagination: {
				invites: { page: 1, maxPages: 0 }
			},
			task: {},
			own: false,
			admin: false
		};
	},
	computed: {
		startDateString() {
			if(!this.request.task) return '';
			const date = new Date(this.task.start);
			let dateString = date.toISOString();
			dateString = dateString.substring(0, dateString.indexOf('.'));
			dateString = dateString.replace('T', ' ');
			return dateString;
		},
		endDateString() {
			if(!this.request.task) return '';
			const date = new Date(this.task.end);
			let dateString = date.toISOString();
			dateString = dateString.substring(0, dateString.indexOf('.'));
			dateString = dateString.replace('T', ' ');
			return dateString;
		},
		statusDate() {
			if(!this.request.task) return false;
			const end = new Date(this.task.end);
			const now = Date.now();
			const status = this.task.status;
			return ((end < now) && !status) ? true : false
		},
		validTask() {
			if(!this.request.task) return false;
			const status = this.task.status;
			const start = new Date(this.task.start);
			const end = new Date(this.task.end);
			if(typeof status != 'boolean') return false;
			if(isNaN(start) || isNaN(end)) return false;
			if(end < start) return false;
			return true;
		}
	},
	methods: {
		async addUser(username) {
			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/task/${this.$route.params.taskid}/users`,
					method: 'post',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						username
					}
				});

				this.getInvites();
			}catch(error) {}
		},
		async getInvites() {
			this.request.invites = false;

			try {
				const request = await axios.request({
					url: `/not/group/${this.$route.params.groupname}/task/${this.$route.params.taskid}/users`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					params: {
						limit: 5,
						page: this.pagination.invites.page,
						like: this.filter.invites.search
					}
				});

				this.invites = request.data.users;
				this.pagination.invites.maxPages = request.data.maxPages;
				this.request.invites = true;
			}catch(error) {}
		},
		async changeStatus() {
			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/task/${this.task.id}`,
					method: 'patch',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						status: !this.task.status
					}
				});

				this.get();
			}catch(error) {}
		},
		async get() {
			this.request.task = false;

			try {
				let request = await axios.request({
					url: `/group/${this.$route.params.groupname}/task/${this.$route.params.taskid}`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					}
				});

				this.task = request.data.task;
				this.task.start = this.task.start.substring(0, this.task.start.indexOf('.'));
				this.task.end = this.task.end.substring(0, this.task.end.indexOf('.'));
				this.own = request.data.owns;

				request = await axios.request({
					url: `/group/${this.$route.params.groupname}/user/${this.store.username}`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					}
				});

				this.role = request.data.relation.role;

				this.request.task = true;
			}catch(error) {
				this.$router.replace(`/group/${this.$route.params.groupname}`);
				return;
			}
		},
		async update() {
			if(!this.validTask) return;

			try {
				const request = await axios.request({
					url: `/task/${this.$route.params.taskid}`,
					method: 'patch',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						description: this.task.description,
						status: this.task.status
					}
				});
			}catch(error) {}
		}
	},
	watch: {
		'filter.invites.search'(newValue, oldValue) {
			this.pagination.invites.page = 1;
			this.getInvites();
		},
		'pagination.invites.page'(newValue, oldValue) {
			this.getInvites();
		}
	}
}
</script>
