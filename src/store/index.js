import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import page from './page/page.reducers';

const reducers = combineReducers ({
    page
})

const store = createStore(
    reducers,
    applyMiddleware(thunk)
);

export default store;