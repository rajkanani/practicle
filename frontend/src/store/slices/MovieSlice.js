// movieSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { APIKEY, APIURL } from '../../const';

// Create an async thunk to fetch movie data
export const fetchMovies = createAsyncThunk('movies/fetchMovies', async (_, { getState }) => {
    const state = getState().movies; // Access the movies slice state

    // Check if movies are already loaded
    if (state.movies.length > 0) {
        return state.movies;
    }

    const apiUrl = `${APIURL}discover/movie?api_key=${APIKEY}`;

    try {
        const response = await axios.get(apiUrl);
        return response.data.results;
    } catch (error) {
        throw error;
    }
});

// Create a slice with initial state
const movieSlice = createSlice({
    name: 'movies',
    initialState: {
        movies: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovies.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.isLoading = false;
                state.movies = action.payload;
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    },
});

// Export the actions and reducer
export default movieSlice.reducer;
