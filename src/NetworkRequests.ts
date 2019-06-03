import axios, { AxiosRequestConfig, AxiosPromise, AxiosInstance, AxiosError } from 'axios';

const config: AxiosRequestConfig = {
    timeout: 1000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    baseURL: 'https://old.reddit.com/'
}

const REDDIT_API: AxiosInstance = axios.create(config);

export let networkRequests: any = {
    fetchComments: (): AxiosPromise => {
        return REDDIT_API
        .get('user/me/comments/.json?count=1000')
        .then(r => r.data)
        .catch((e: AxiosError) => {
            if (e.response.status === 401) {
                alert(`You are not logged in to your reddit account. Please login and try again: Error Code ${e.response.status}`)
            }
            if (e.response) {
                // 2xx + codes
                alert(`Fetching comments failed with Error Code ${e.response.status}`)
            }
        });
    }

}