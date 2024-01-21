<template>
	<Menu/>
	<main>
		<h1><LogoText/> - My groups</h1>

		<h2 class="sel" @click="show.add = !show.add">Add new group</h2>
		<template v-if="show.add">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="name">Name</label>
				<input id="name" type="text" v-model="newGroup.name"/>
			</div>
			<button @click="add" :disabled="!validGroup">Add</button>
		</form>
		</template>

		<h2 class="sel" @click="show.list.groups = !show.list.groups">List of groups</h2>
		<template v-if="show.list.groups">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="search">Search</label>
				<input id="search" type="text" v-model="filter.groups.search"/>
			</div>
		</form>
		<template v-if="request.groups">
		<div class="pagination">
			<p class="sel" v-if="pagination.groups.page > 1" @click="pagination.groups.page--">Previous</p>
			<p v-else>Previous</p>
			<input v-model="pagination.groups.page" type="number" min="1" :max="pagination.groups.maxPages"/>
			<p class="sel" v-if="pagination.groups.page < pagination.groups.maxPages" @click="pagination.groups.page++">Next</p>
			<p v-else>Next</p>
		</div>
		<table v-if="groups.length + addedGroups.length > 0">
			<tr>
				<th>Name</th>
				<th><span class="material-symbols-outlined">person</span> Role</th>
				<th><span class="material-symbols-outlined">list</span> Actions</th>
			</tr>
			<tr v-for="group in addedGroups">
				<td>{{ group.name }} new</td>
				<td>{{ (group.role == 0) ? 'Admin': 'Member' }}</td>
				<td><button @click="$router.push(`/group/${group.name}`)">Details</button></td>
			</tr>
			<tr v-for="group in groups">
				<td>{{ group.name }}</td>
				<td>{{ (group.GroupUser.role == 0) ? 'Admin': 'Member' }}</td>
				<td><button @click="$router.push(`/group/${group.name}`)">Details</button></td>
			</tr>
		</table>
		<p v-else>Looks like you are not an member of any groups.</p>
		</template>
		</template>

		<h2 class="sel" @click="show.list.invites = !show.list.invites">List of invites</h2>
		<template v-if="show.list.invites">
		<form class="form-blocks" @submit.prevent="">
			<div>
				<label for="search-invites">Search</label>
				<input id="search-invites" type="text" v-model="filter.invites.search"/>
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
				<th>Name</th>
				<th><span class="material-symbols-outlined">list</span> Actions</th>
			</tr>
			<tr v-for="invite in invites">
				<td>{{ invite.name }}</td>
				<td>
					<button @click="accept(invite)">Accept</button>
					<button @click="decline(invite.name)">Decline</button>
				</td>
			</tr>
		</table>
		<p v-else>Looks like you do not have any invites.</p>
		</template>
		</template>

	</main>
	<Modal :show="show.modal" @close="show.modal = false">
		<template #title>Group creation error</template>
		<template #body>Group name already in use</template>
	</Modal>
</template>

<script>
import Menu from '@/components/Menu.vue';
import LogoText from '@/components/LogoText.vue';
import Modal from '@/components/Modal.vue';
import { useUserStore } from '@/stores/user';
import axios from '@/modules/api';
import { validName } from '@/modules/auth';

export default {
	components: {
		Menu,
		LogoText,
		Modal
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

		await this.getGroups();
		await this.getInvites();

		document.title = 'Task[\'s\'] - My groups';
	},
	data() {
		return {
			request: {
				groups: false,
				invites: false
			},
			show: {
				add: false,
				modal: false,
				list: { groups: true, invites: true }
			},
			filter: {
				groups: {
					search: null
				},
				invites: {
					search: null
				}
			},
			pagination: {
				groups: { page: 1, maxPages: 0 },
				invites: { page: 1, maxPages: 0 }
			},
			newGroup: {
				name: ''
			},
			groups: [],
			addedGroups: [],
			invites: []
		};
	},
	computed: {
		validGroup() {
			const name = this.newGroup.name;
			if(typeof name != 'string' || !validName.test(name)) return false;
			return true;
		}
	},
	methods: {
		async getGroups() {
			this.request.groups = false;
			this.pagination.groups.page = 1;

			try {
				let request = await axios.request({
					url: '/auser/groups',
					method: 'get',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					params: {
						limit: 5,
						page: this.pagination.groups.page,
						like: this.filter.groups.search
					}
				});

				this.groups = request.data.groups;
				this.pagination.groups.maxPages = request.data.maxPages;
				this.request.groups = true;
			}catch(error) {}
		},
		async getInvites() {
			this.request.invites = false;
			this.pagination.invites.page = 1;

			try {
				const request = await axios.request({
					url: '/auser/groups/invites',
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

				this.invites = request.data.groups;
				this.pagination.invites.maxPages = request.data.maxPages;
				this.request.invites = true;
			}catch(error) {}
		},
		async add() {
			if(!this.validGroup) return;

			try {
				const request = await axios.request({
					url: '/auser/groups',
					method: 'post',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						name: this.newGroup.name
					}
				});

				this.newGroup.name = '';

				const group = request.data.group;
				group.role = 0;

				this.addedGroups.unshift(group);
			}catch(error) {
				this.show.modal = true;
			}
		},
		async accept(group) {
			try {
				const request = await axios.request({
					url: `/group/${group.name}/auser`,
					method: 'patch',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					},
					data: {
						role: 1
					}
				});

				delete group.GroupUser;
				group.role = 1;

				this.addedGroups.unshift(group);

				this.getInvites();
			}catch(error) {}
		},
		async decline(groupname) {
			try {
				const request = await axios.request({
					url: `/group/${groupname}/auser`,
					method: 'delete',
					headers: {
						Authorization: `Bearer ${this.store.token}`
					}
				});

				this.getInvites();
			}catch(error) {}
		}
	},
	watch: {
		'filter.groups.search'(newValue, oldValue) {
			this.get();
		},
		'filter.groups.done'(newValue, oldValue) {
			this.get();
		}
	}
}
</script>
