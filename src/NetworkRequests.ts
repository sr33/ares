import axios, { AxiosRequestConfig, AxiosPromise, AxiosInstance, AxiosError } from 'axios';
// @ts-ignore
import * as qs from 'qs';

const config: AxiosRequestConfig = {
    timeout: 10000,
    headers: {
        'Accept': '*/*',
    },
    baseURL: 'https://www.reddit.com/'
}

const REDDIT_API: AxiosInstance = axios.create(config);

export let networkRequests: any = {
    getUserDetails: (): AxiosPromise => REDDIT_API.get('api/me.json'),
    getComments: (username: string, queryString: string): AxiosPromise => {
        return REDDIT_API
        .get(`user/${username}/comments/.json${queryString || ''}`)
        .then(r => r.data)
        .catch((e: AxiosError) => {
            console.log(`Fetching comments failed with Error ${e}`)
        });
    },
    editComment: (data: any, uh:string) => {
        return REDDIT_API.post('api/editusertext', qs.stringify(data), {headers: {'X-Modhash': uh,}});
    },
    deleteRedditThing: (data: any, uh: string) => {
        return REDDIT_API.post('api/del', qs.stringify(data), {headers: {'X-Modhash': uh}});
    },
    getPosts: (username: string, queryString: string): AxiosPromise => {
        return REDDIT_API.get(`user/${username}/submitted/.json${queryString || ''}`)
        .then(r => r.data)
        .catch((e: AxiosError) => {
            console.log(`Fetching posts failed with Error Code ${e}`)
        });
    },

}