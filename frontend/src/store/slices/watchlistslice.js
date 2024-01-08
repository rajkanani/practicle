// slices/watchlistSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = JSON.parse(localStorage.getItem("watchlist")) || [];

const watchlistSlice = createSlice({
    name: 'watchlist',
    initialState,
    reducers: {
        addItem: (state, action) => {
            const indexToRemove = state.findIndex(item => item.id === action.payload.id);
            if (indexToRemove == -1) {
                state.push(action.payload);
            }


        },
        removeItem: (state, action) => {

            const indexToRemove = state.findIndex(item => item.id === action.payload.id);
            if (indexToRemove !== -1) {
                state.splice(indexToRemove, 1);
            }
        },
    },
});

export const { addItem, removeItem } = watchlistSlice.actions;

export default watchlistSlice.reducer;
