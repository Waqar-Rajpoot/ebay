import axios from "axios";

const API_BASE_URL = "/api";
const API_TIMEOUT_MS = 30_000;

/** Shared axios instance for calls to this app's own API routes. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});