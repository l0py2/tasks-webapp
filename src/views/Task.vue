<template>
	<Menu/>
	<main v-if="request.task">
		<h1><LogoText/> - Task {{ task.name }}</h1>
		<button v-if="show.edit" @click="update(); show.edit = false;" :disabled="!validTask">Done</button>
		<button v-else @click="show.edit = true">Edit</button>
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

		document.title = `Task['s'] - Task ${this.task.id}`;
	},
	data() {
		return {
			request: {
				task: false
			},
			show: {
				edit: false
			},
			task: {}
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
		async get() {
			this.request.task = false;

			try {
				const request = await axios.request({
					url: `/task/${this.$route.params.taskid}`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					}
				});

				this.task = request.data.task;
				this.task.start = this.task.start.substring(0, this.task.start.indexOf('.'));
				this.task.end = this.task.end.substring(0, this.task.end.indexOf('.'));
				this.request.task = true;
			}catch(error) {
				this.$router.replace('/tasks');
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
	}
}
</script>
