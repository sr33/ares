import axios, { AxiosRequestConfig, AxiosPromise, AxiosInstance, AxiosError } from 'axios';
// @ts-ignore
import * as qs from 'qs';

const config: AxiosRequestConfig = {
    timeout: 1000,
    headers: {
        'Accept': '*/*',
    },
    baseURL: 'https://old.reddit.com/'
}

const REDDIT_API: AxiosInstance = axios.create(config);

export let networkRequests: any = {
    getUserDetails: (): AxiosPromise => {
        return REDDIT_API
        .get('api/me.json')
        .then(r => r.data)
        .catch((e: AxiosError) => {
            if (e.response.status === 401) {
                alert(`You are not logged in to your reddit account. Please login and try again: Error Code ${e.response.status}`)
            }
            if (e.response) {
                // 2xx + codes
                alert(`Fetching User Information failed with Error Code ${e.response.status}`)
            }
        })
    },
    getComments: (username: string): AxiosPromise => {
        return REDDIT_API
        .get(`user/${username}/comments/.json`)
        .then(r => r.data)
        .catch((e: AxiosError) => {
            if (e.response.status === 401) {
                alert(`You are not logged in to your reddit account. Please login and try again: Error Code ${e.response.status}`)
            }
            else if (e.response) {
                // 2xx + codes
                alert(`Fetching comments failed with Error Code ${e.response.status}`)
            }
        });
    },
    editComment: (data: any, uh:string) => {
        return REDDIT_API.post('api/editusertext', qs.stringify(data), {headers: {'X-Modhash': uh,}});
    },
    deleteComment: (data: any, uh: string) => {
        return REDDIT_API.post('api/del', qs.stringify(data), {headers: {'X-Modhash': uh}});
    }

}