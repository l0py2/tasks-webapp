<template>
	<Menu/>
	<main v-if="request.role && request.group">
		<h1><LogoText/> - Group {{ group.name }}</h1>

		<template v-if="role == 0">

		<h2 class="sel" @click="show.add.user = !show.add.user">Add new user to the group</h2>
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

		<h2 class="sel" @click="show.add.task = !show.add.task">Add new task</h2>
		<form class="form-blocks" v-if="show.add.task" @submit.prevent="">
			<div>
				<label for="task-name">Name</label>
				<input id="task-name" type="text" v-model="newTask.name"/>
			</div>
			<div>
				<label for="task-description">Description</label>
				<textarea id="task-description" v-model="newTask.description"></textarea>
			</div>
			<div>
				<label for="task-status">Task status (done or not done):</label>
				<input id="task-status" type="checkbox" v-model="newTask.status"/>
			</div>
			<div>
				<label for="task-start">Task start date</label>
				<input id="task-start" type="datetime-local" v-model="newTask.start"/>
			</div>
			<div>
				<label for="task-end">Task end date</label>
				<input id="task-end" type="datetime-local" v-model="newTask.end"/>
			</div>
			<button @click="addTask" :disabled="!validTask">Add</button>
		</form>
		</template>

		<h2 class="sel" @click="show.list.usertasks = !show.list.usertasks">Group tasks for you</h2>
		<template v-if="show.list.usertasks">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="search-usertasks">Search</label>
				<input id="search-usertasks" type="text" v-model="filter.usertasks.search"/>
			</div>
			<div>
				<label for="show-done-usertasks">Show done:</label>
				<input id="show-done-usertasks" type="checkbox" v-model="filter.usertasks.done"/>
			</div>
		</form>
		<template v-if="request.tasks">
		<div class="pagination">
			<p class="sel" v-if="pagination.usertasks.page > 1" @click="pagination.usertasks.page--">Previous</p>
			<p v-else>Previous</p>
			<input v-model="pagination.usertasks.page" type="number" min="1" :max="pagination.usertasks.maxPages"/>
			<p class="sel" v-if="pagination.usertasks.page < pagination.usertasks.maxPages" @click="pagination.usertasks.page++">Next</p>
			<p v-else>Next</p>
		</div>
		<table v-if="usertasks.length > 0">
			<tr>
				<th>Name (id)</th>
				<th><span class="material-symbols-outlined">event</span> Conclustion date</th>
				<th><span class="material-symbols-outlined">done</span> Status</th>
				<th><span class="material-symbols-outlined">list</span> Actions</th>
			</tr>
			<tr v-for="task in usertasks">
				<td>{{ `${task.name} (${task.id})` }}</td>
				<td>{{ task.end.replace('T', ' ').substring(0, task.end.indexOf('.')) }}</td>
				<td>{{ task.status ? 'Done' : 'Not done' }} </td>
				<td>
					<button @click="changeStatus(task)">{{ task.status ? 'Mark as not done' : 'Mark as done' }}</button>
					<button @click="$router.push(`/group/${group.name}/task/${task.id}`)">Details</button>
				</td>
			</tr>
		</table>
		<p v-else>Looks like you do not have any tasks.</p>
		</template>
		</template>

		<h2 class="sel" @click="show.list.users = !show.list.users">List of users</h2>
		<template v-if="show.list.users">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="search-users">Search</label>
				<input id="search-users" type="text" v-model="filter.users.search"/>
			</div>
		</form>
		<template v-if="request.users">
		<div class="pagination">
			<p class="sel" v-if="pagination.users.page > 1" @click="pagination.users.page--">Previous</p>
			<p v-else>Previous</p>
			<input v-model="pagination.users.page" type="number" min="1" :max="pagination.users.maxPages"/>
			<p class="sel" v-if="pagination.users.page < pagination.users.maxPages" @click="pagination.users.page++">Next</p>
			<p v-else>Next</p>
		</div>
		<table>
			<tr>
				<th>Username</th>
				<th><span class="material-symbols-outlined">person</span> Role</th>
				<th v-if="role == 0"><span class="material-symbols-outlined">list</span> Actions</th>
			</tr>
			<tr v-for="user in users">
				<td>{{ user.username }}</td>
				<td>{{ (user.GroupUser.role == 0) ? 'Admin': 'Member' }}</td>
				<td v-if="role == 0">
					<template v-if="user.username != store.username">
					<button @click="removeUser(user.username)">Remove</button>
					<button @click="updateUserRole(user)">{{ (user.GroupUser.role == 0) ? 'Revoke admin' : 'Grant admin' }}</button>
					</template>
				</td>
			</tr>
		</table>
		</template>
		</template>

		<h2 class="sel" @click="show.list.tasks = !show.list.tasks">List of group tasks</h2>
		<template v-if="show.list.tasks">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="search-tasks">Search</label>
				<input id="search-tasks" type="text" v-model="filter.tasks.search"/>
			</div>
			<div>
				<label for="show-done-tasks">Show done:</label>
				<input id="show-done-tasks" type="checkbox" v-model="filter.tasks.done"/>
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
				<td>{{ task.status ? 'Done' : 'Not done' }} </td>
				<td><button @click="$router.push(`/group/${group.name}/task/${task.id}`)">Details</button></td>
			</tr>
			<tr v-for="task in tasks">
				<td>{{ `${task.name} (${task.id})` }}</td>
				<td>{{ task.end.replace('T', ' ').substring(0, task.end.indexOf('.')) }}</td>
				<td>{{ task.status ? 'Done' : 'Not done' }} </td>
				<td><button @click="$router.push(`/group/${group.name}/task/${task.id}`)">Details</button></td>
			</tr>
		</table>
		<p v-else>Looks like the group does not have any tasks.</p>
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

		await this.getGroup();
		await this.getRole();
		await this.getUsers();
		await this.getInvites();
		await this.getTasks();
		await this.getUsertasks();

		document.title = `Task['s'] - Group ${this.group.name}`;
	},
	data() {
		return {
			request: { role: false, group: false, users: false, tasks: false, usertasks: false },
			show: {
				add: { taks: false, user: false },
				list: { usertasks: true, users: false, tasks: false }
			},
			filter: {
				users: { search: null },
				invites: { search: null },
				tasks: { search: null, done: false },
				usertasks: { search: null, done: false }
			},
			pagination: {
				invites: { page: 1, maxPages: 0 },
				usertasks: { page: 1, maxPages: 0 },
				tasks: { page: 1, maxPages: 0 },
				users: { page: 1, maxPages: 0 }
			},
			newTask: {
				name: '',
				description: '',
				status: false,
				start: '',
				end: ''
			},
			role: -1,
			group: {},
			users: [],
			invites: [],
			tasks: [],
			addedTasks: [],
			usertasks: []
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
					url: `/group/${this.$route.params.groupname}/task/${task.id}`,
					method: 'patch',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						status: !task.status
					}
				});

				this.getUsertasks();
			}catch(error) {}
		},
		async getRole() {
			this.request.role = false;

			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/user/${this.store.username}`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					}
				});

				this.role = request.data.relation.role;
				this.request.role = true;
			}catch(error) {
				this.$router.replace('/groups');
				return;
			}
		},
		async getGroup() {
			this.request.group = false;

			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					}
				});

				this.group = request.data.group;
				this.request.group = true;
			}catch(error) {
				this.$router.replace('/groups');
				return;
			}
		},
		async getInvites() {
			this.request.invites = false;

			try {
				const request = await axios.request({
					url: `/not/group/${this.$route.params.groupname}/users`,
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
		async getUsertasks() {
			this.request.usertasks = false;

			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/auser/tasks`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					params: {
						limit: 5,
						page: this.pagination.usertasks.page,
						like: this.filter.usertasks.search,
						showdone: this.filter.usertasks.done
					}
				});

				this.usertasks = request.data.tasks;
				this.pagination.usertasks.maxPages = request.data.maxPages;
				this.request.usertasks = true;
			}catch(error) {}
		},
		async getUsers() {
			this.request.users = false;

			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/users`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					params: {
						limit: 5,
						page: this.pagination.users.page,
						like: this.filter.users.search
					}
				});

				this.users = request.data.users;
				this.pagination.users.maxPages = request.data.maxPages;
				this.request.users = true;
			}catch(error) {}
		},
		async getTasks() {
			this.request.tasks = false;

			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/tasks`,
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					params: {
						limit: 5,
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
		async addTask() {
			if(!this.validTask) return;

			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/tasks`,
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
		},
		async addUser(username) {
			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/users`,
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
		async updateUserRole(user) {
			try {
				const role = (user.GroupUser.role == 0) ? 1 : 0;

				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/user/${user.username}`,
					method: 'patch',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						role
					}
				});

				this.getUsers();
			}catch(error) {}
		},
		async removeUser(username) {
			try {
				const request = await axios.request({
					url: `/group/${this.$route.params.groupname}/user/${username}`,
					method: 'delete',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					}
				});

				this.getUsers();
				this.getInvites();
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
		},
		'filter.usertasks.search'(newValue, oldValue) {
			this.pagination.usertasks.page = 1;
			this.getUsertasks();
		},
		'filter.usertasks.done'(newValue, oldValue) {
			this.pagination.usertasks.page = 1;
			this.getUsertasks();
		},
		'pagination.usertasks.page'(newValue, oldValue) {
			this.getUsertasks();
		},
		'filter.users.search'(newValue, oldValue) {
			this.pagination.users.page = 1;
			this.getUsers();
		},
		'pagination.users.page'(newValue, oldValue) {
			this.getUsers();
		},
		'filter.tasks.search'(newValue, oldValue) {
			this.pagination.tasks.page = 1;
			this.getTasks();
		},
		'filter.tasks.done'(newValue, oldValue) {
			this.pagination.tasks.page = 1;
			this.getTasks();
		},
		'pagination.tasks.page'(newValue, oldValue) {
			this.getTasks();
		}
	}
}
</script>
