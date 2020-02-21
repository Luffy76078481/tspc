import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import Middleware from "./middleware";

const configureStore = (preloadedState?:any) => createStore(
  rootReducer,
  preloadedState,
  applyMiddleware(thunk, Middleware)
);

export default configureStore
 