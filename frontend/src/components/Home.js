import React, { useEffect, useState } from 'react';
import MainLayout from './Layout/MainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies } from '../store/slices/MovieSlice';
import { useNavigate } from 'react-router-dom';
import Recipe from './Common/Recipe';



function Home(props) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { movies, isLoading, error } = useSelector((state) => state.movies);

    useEffect(() => {
        dispatch(fetchMovies());

    }, [dispatch]);



    const [searchvalue, setsearchvalue] = useState("")
    const searchbar = (e) => {
        e.preventDefault()
        navigate(`/search?query=${searchvalue}`)
    }

    return (
        <MainLayout>
            <section className='container common-section hero-section'>
                <div className='row h-100 align-items-center'>
                    <div className='col-md-12'>
                        <h1>
                            Welcome.
                        </h1>
                        <p>Thousands of recipe.</p>
                        <div className='searchbar-home position-relative'>
                            <form onSubmit={(e) => searchbar(e)}>
                                <input value={searchvalue} onChange={(e) => setsearchvalue(e.target.value)} type="text" className='form-control' placeholder='Search for a recipe......' />
                                <button type='submit' className='btn search-submit'>
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <section className='container common-section'>
                <div className='row movie-section'>
                    <Recipe data={movies} />
                </div>
            </section>
        </MainLayout>
    );
}

export default Home;