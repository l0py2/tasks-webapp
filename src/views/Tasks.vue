<template>
	<Menu/>
	<main>
		<h1><LogoText/> - Personnal tasks</h1>

		<h2 class="sel" @click="show.add = !show.add">Add new task</h2>
		<form class="form-blocks" v-show="show.add" @submit.prevent="">
			<div>
				<label for="name">Name</label>
				<input id="name" type="text" v-model="newTask.name"/>
			</div>
			<div>
				<label for="description">Description</label>
				<textarea id="description" v-model="newTask.description"></textarea>
			</div>
			<div>
				<label for="status">Task status (done or not done):</label>
				<input id="status" type="checkbox" v-model="newTask.status"/>
			</div>
			<div>
				<label for="start">Task start date</label>
				<input id="start" type="datetime-local" v-model="newTask.start"/>
			</div>
			<div>
				<label for="end">Task end date</label>
				<input id="end" type="datetime-local" v-model="newTask.end"/>
			</div>
			<button @click="add" :disabled="!validTask">Add</button>
		</form>

		<h2 class="sel" @click="show.list.tasks = !show.list.tasks">List of tasks</h2>
		<template v-if="show.list.tasks">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="search">Search</label>
				<input id="search" type="text" v-model="filter.tasks.search"/>
			</div>
			<div>
				<label for="show-done">Show done:</label>
				<input id="show-done" type="checkbox" v-model="filter.tasks.done"/>
			</div>
		</form>
		<template v-if="request.tasks">
		<div class="pagination">
			<p class="sel" v-if="pagination.tasks.page > 1" @click="pagination.tasks.page--">Previous</p>
			<p v-else>Previous</p>
			<input v-model="pagination.tasks.page" type="number" min="1" :max="pagination.tasks.maxPages"/>
			<p class="sel" v-if="pagination.tasks.page < pagination.tasks.maxPages" @click="pagination.tasks.page++">Next</p>
			<p v-else>Next</p>
		</div>
		<table v-if="tasks.length + addedTasks.length > 0">
			<tr>
				<th>Name (id)</th>
				<th><span class="material-symbols-outlined">event</span> Conclustion date</th>
				<th><span class="material-symbols-outlined">done</span> Status</th>
				<th><span class="material-symbols-outlined">list</span> Actions</th>
			</tr>
			<tr v-for="task in addedTasks">
				<td>{{ `${task.name} (${task.id})` }} new</td>
				<td>{{ task.end.replace('T', ' ').substring(0, task.end.indexOf('.')) }}</td>
				<td>{{ task.status ? 'Done' : 'Not done' }}</td>
				<td>
					<button @click="changeStatus(task)">{{ task.status ? 'Mark as not done' : 'Mark as done' }}</button>
					<button @click="$router.push(`/task/${task.id}`)">Details</button>
				</td>
			</tr>
			<tr v-for="task in tasks">
				<td>{{ `${task.name} (${task.id})` }}</td>
				<td>{{ task.end.replace('T', ' ').substring(0, task.end.indexOf('.')) }}</td>
				<td>{{ task.status ? 'Done' : 'Not done' }}</td>
				<td>
					<button @click="changeStatus(task)">{{ task.status ? 'Mark as not done' : 'Mark as done' }}</button>
					<button @click="$router.push(`/task/${task.id}`)">Details</button>
				</td>
			</tr>
		</table>
		<p v-else>Looks like you do not have any tasks.</p>
		</template>
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

		document.title = 'Task[\'s\'] - Personnal tasks';
	},
	data() {
		return {
			request: {
				tasks: false
			},
			show: {
				add: false,
				list: { tasks: true }
			},
			filter: {
				tasks: {
					search: null,
					done: false
				}
			},
			pagination: {
				tasks: {
					page: 1,
					maxPages: 0,
				}
			},
			newTask: {
				name: '',
				description: '',
				status: false,
				start: '',
				end: ''
			},
			tasks: [],
			addedTasks: []
		};
	},
	computed: {
		validTask() {
			const name = this.newTask.name;
			const status = this.newTask.status;
			const start = new Date(this.newTask.start);
			const end = new Date(this.newTask.end);
			if(typeof name != 'string' || name.length == 0) return false;
			if(typeof status != 'boolean') return false;
			if(isNaN(start) || isNaN(end)) return false;
			if(end < start) return false;
			return true;
		}
	},
	methods: {
		async changeStatus(task) {
			try {
				const request = await axios.request({
					url: `/task/${task.id}`,
					method: 'patch',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						status: !task.status
					}
				});

				this.get();
			}catch(error) {}
		},
		async get() {
			this.request.tasks = false;
			this.pagination.tasks.page = 1;

			try {
				const request = await axios.request({
					url: '/auser/tasks',
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					params: {
						limit: 1,
						page: this.pagination.tasks.page,
						like: this.filter.tasks.search,
						showdone: this.filter.tasks.done
					}
				});

				this.tasks = request.data.tasks;
				this.pagination.tasks.maxPages = request.data.maxPages;
				this.request.tasks = true;
			}catch(error) {}
		},
		async add() {
			if(!this.validTask) return;

			try {
				const request = await axios.request({
					url: '/auser/tasks',
					method: 'post',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						name: this.newTask.name,
						description: this.newTask.description,
						status: this.newTask.status,
						start: this.newTask.start,
						end: this.newTask.end
					}
				});

				this.newTask.name = '';
				this.newTask.description = '';
				this.newTask.status = false;
				this.newTask.start = '';
				this.newTask.end = '';

				this.addedTasks.unshift(request.data.task);
			}catch(error) {}
		}
	},
	watch: {
		'filter.tasks.search'(newValue, oldValue) {
			this.get();
		},
		'filter.tasks.done'(newValue, oldValue) {
			this.get();
		},
		'pagination.tasks.page'(newValue, oldValue) {
			this.get();
		}
	}
}
</script>
