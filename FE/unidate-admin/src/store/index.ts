import { createStore } from 'redux';

// Initial state
const initialState = {
  users: [],
  settings: {},
  auth: {
    isAuthenticated: false,
    user: null,
  },
};

// Action types
const ADD_USER = 'ADD_USER';
const REMOVE_USER = 'REMOVE_USER';
const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';

// Reducer
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER:
      return {
        ...state,
        users: [...state.users, action.payload],
      };
    case REMOVE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload.id),
      };
    case UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case LOGIN:
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload,
        },
      };
    case LOGOUT:
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
        },
      };
    default:
      return state;
  }
};

// Create store
const store = createStore(rootReducer);

export default store;