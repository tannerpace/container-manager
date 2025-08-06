import type { DockerAction, DockerState } from '../types/dockerTypes'

export const initialState: DockerState = {
  containers: [],
  images: [],
  volumes: [],
  networks: [],
  loading: false,
  error: null,
  connected: false,
  searchTerm: "",
}

export function dockerReducer(state: DockerState, action: DockerAction): DockerState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_CONNECTED":
      return { ...state, connected: action.payload }
    case "SET_CONTAINERS":
      return { ...state, containers: action.payload, loading: false }
    case "SET_IMAGES":
      return { ...state, images: action.payload, loading: false }
    case "SET_VOLUMES":
      return { ...state, volumes: action.payload, loading: false }
    case "SET_NETWORKS":
      return { ...state, networks: action.payload, loading: false }
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload }
    default:
      return state
  }
}
