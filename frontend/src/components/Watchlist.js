import React, { useEffect, useState } from 'react';
import Movies from './Common/Recipe';
import MainLayout from './Layout/MainLayout';

function Watchlist(props) {
    const [movies, setmovies] = useState([])


    const data = localStorage.getItem("watchlist")
    useEffect(() => {
        if (data) {
            setmovies(JSON.parse(data))
        }

    }, [data])

    const remainingdata = (data) => {
        setmovies(data)
    }

    return (
        <MainLayout>
            <section className='container common-section'>
                <div className='row movie-section'>
                    <Movies data={movies} remainingdata={remainingdata} />
                </div>
            </section>

        </MainLayout>
    );
}

export default Watchlist;