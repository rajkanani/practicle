// store.js
import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './slices/MovieSlice';
import watchlistReducer from './slices/watchlistslice'

const store = configureStore({
    reducer: {
        movies: movieReducer,
        watchlist: watchlistReducer,
    },
});

export default store;
