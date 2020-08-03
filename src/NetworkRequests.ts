import axios, {
  AxiosRequestConfig,
  AxiosPromise,
  AxiosInstance,
  AxiosError,
} from "axios";
import Swal from "sweetalert2";

// @ts-ignore
import * as qs from "qs";

const config: AxiosRequestConfig = {
  timeout: 10000,
  headers: {
    Accept: "*/*",
  },
  baseURL: "https://www.reddit.com/",
};

const REDDIT_API: AxiosInstance = axios.create(config);

export let networkRequests: any = {
  getUserDetails: (): AxiosPromise => REDDIT_API.get("api/me.json"),
  getComments: (username: string, queryString: string): AxiosPromise => {
    return REDDIT_API.get(
      `user/${username}/comments/.json${queryString || ""}`
    );
  },
  editComment: (data: any, uh: string) => {
    return REDDIT_API.post("api/editusertext", qs.stringify(data), {
      headers: { "X-Modhash": uh },
    });
  },
  deleteRedditThing: (data: any, uh: string) => {
    return REDDIT_API.post("api/del", qs.stringify(data), {
      headers: { "X-Modhash": uh },
    });
  },
  getPosts: (username: string, queryString: string): AxiosPromise => {
    return REDDIT_API.get(
      `user/${username}/submitted/.json${queryString || ""}`
    )
      .then((r) => r.data)
      .catch((e: AxiosError) => {
        console.log(`Fetching posts failed with Error Code ${e}`);
      });
  },
};

export const handleNetworkError = (error: AxiosError) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status: number = error.response.status;

    if (status === 401) {
      Swal.fire({
        icon: "error",
        title: "Not logged in",
        text: "Login to reddit and try again",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops ...",
        text: `reddit responded with the error code ${status}`,
      });
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Looks like reddit isn't responding. Please try again later",
    });
  } else {
    // Something happened in setting up the request that triggered an Error
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text:
        "The extension failed to make proper requests to reddit. Please try again later",
    });
  }
};
