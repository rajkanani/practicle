import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { json, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addItem, removeItem } from '../../store/slices/watchlistslice';

function Movies(props) {
    const dispatch = useDispatch();
    const watchlist_state = useSelector(state => state.watchlist);
    const [watchlistdata, setwatchlistdata] = useState([])
    const [data, setdata] = useState(props.data)


    const whatchlist = (e, data) => {
        if (e.target.checked) {
            dispatch(addItem(data));
            toast.success("added to watchlist");

        } else {
            dispatch(removeItem(data));
            toast.success("remove from watchlist");

        }
    }

    useEffect(() => {
        let temp_data = [...watchlist_state]

        localStorage.setItem("watchlist", JSON.stringify(temp_data))

        if (props.remainingdata) props.remainingdata(temp_data)
        setwatchlistdata(temp_data);

        setdata(props.data)

    }, [watchlist_state])


    useEffect(() => {

        let data = localStorage.getItem("watchlist")
        if (data) {
            const parsed_data = JSON.parse(data)
            parsed_data.length > 0 && parsed_data.map((item) => {
                dispatch(addItem(item));
            })
            setwatchlistdata(watchlistdata.concat(parsed_data))
        }
    }, [])

    useEffect(() => {
        setdata(props.data)
    }, [props.data])


    return (
        <>
            {data.length > 0 && data.map((item, i) => {
                return (
                    <div key={i} className='col-lg-2 col-md-3 col-6 mb-3'>
                        <div className='white-box'>
                            <Link to={`/recipe/${item.id}`} title={item.title}>
                                <img className='img-fluid' src={item.poster_path ? `https://www.themoviedb.org/t/p/w220_and_h330_face/${item.poster_path}` : "./assets/images/nodata.svg"} loading='lazy' alt="" />
                            </Link>
                            <div className='desc-div mt-auto'>
                                <div>
                                    <p>{item.title}</p>
                                </div>
                                <bdi>{new Date(item.release_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</bdi>
                            </div>
                            <div className='cust-watchlist'>
                                <div className="form-check form-check-inline">
                                    <input checked={watchlistdata.some(movie => movie.id === item.id)} className="form-check-input d-none" onChange={(e) => whatchlist(e, item)} type="checkbox" id={`cust-radio${item.id}`} />
                                    <label className="form-check-label" htmlFor={`cust-radio${item.id}`}>
                                        <span className='without-fill'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-suit-heart" viewBox="0 0 16 16">
                                                <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595L8 6.236zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.55 7.55 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" fill="#000" />
                                            </svg>
                                        </span>
                                        <span className='fill'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                                                <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z" fill='red' />
                                            </svg>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                    </div>
                )
            })}
            {data.length == 0 &&
                <div className='text-center'>
                    <h5 className='text-black'>No Data found</h5>
                </div>
            }
        </>
    );
}

export default Movies;