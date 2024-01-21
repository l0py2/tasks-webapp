/*
 * Collection of functions to help with auth
 */

import axios from './api';

function extractToken(token) {
	if(!token) {
		return null;
	}

	const tokenParts = token.split('.');

	if(tokenParts.length != 3) {
		return null;
	}

	try {
		const verifiedTokenParts = {
			header: JSON.parse(atob(tokenParts[0])),
			payload: JSON.parse(atob(tokenParts[1]))
		};

		return verifiedTokenParts;
	}catch(error) {
		return null;
	}
}

async function updateToken() {
	const token = localStorage.getItem('token');

	if(!token) {
		return null;
	}

	try {
		const request = await axios.request({
			url: '/refresh',
			method: 'post',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		localStorage.setItem('token', request.data.token);

		const tokenParts = extractToken(request.data.token);

		return {
			token: request.data.token,
			header: tokenParts.header,
			payload: tokenParts.payload
		}
	}catch(error) {
		return null;
	}
}

const validName = /^[a-z0-9_-]+$/;

export { extractToken, updateToken, validName };
