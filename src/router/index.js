import { createRouter, createWebHistory } from 'vue-router';

import About from '@/views/About.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Groups from '@/views/Groups.vue';
import Group from '@/views/Group.vue';
import Tasks from '@/views/Tasks.vue';
import Task from '@/views/Task.vue';
import GroupTask from '@/views/GroupTask.vue';

export default createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			component: About
		},
		{
			path: '/login',
			component: Login
		},
		{
			path: '/register',
			component: Register
		},
		{
			path: '/groups',
			component: Groups
		},
		{
			path: '/group/:groupname',
			component: Group
		},
		{
			path: '/tasks',
			component: Tasks
		},
		{
			path: '/task/:taskid',
			component: Task
		},
		{
			path: '/group/:groupname/task/:taskid',
			component: GroupTask
		}
	]
});
