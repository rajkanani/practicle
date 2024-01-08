import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { APIKEY, APIURL } from '../const';
import MainLayout from './Layout/MainLayout';

function Recipe(props) {
    const { id } = useParams();
    const [details, setdetails] = useState({})

    useEffect(() => {

        async function fetchdata() {
            if (id) {
                try {
                    const apiUrl = `${APIURL}movie/${id}?api_key=${APIKEY}`;
                    let search_data = await axios.get(apiUrl)
                    setdetails(search_data.data)
                } catch (error) {
                    console.log('%cRecipe.js line:18 search_data', 'color: #007acc;', error);
                }

            }
        }

        fetchdata()

    }, [])

    return (
        <MainLayout>
            {Object.keys(details).length > 0 ?
                <section className='container-fluid details-section-main py-5'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-md-3'>
                                <img src={details.poster_path ? `https://www.themoviedb.org/t/p/w220_and_h330_face/${details.poster_path}` : "./assets/images/nodata.svg"} loading="lazy" alt={details.title} className="img-fluid" />
                            </div>
                            <div className='col-md-9'>
                                <div className='info-sec'>
                                    <h1>
                                        {details.title} ({new Date(details.release_date).toLocaleDateString("en-US", { year: 'numeric' })})
                                    </h1>
                                    <p>
                                        {(() => {
                                            const inputDate = "1997-01-01";
                                            const dateObject = new Date(inputDate);
                                            const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Pad month with leading zero
                                            const day = dateObject.getDate().toString().padStart(2, '0'); // Pad day with leading zero
                                            const year = dateObject.getFullYear();
                                            const formattedDate = `${month}/${day}/${year}`;
                                            return formattedDate
                                        })()}

                                        <span className='mx-2'>
                                            <bdi className='me-2'>&#9679;</bdi>
                                            {details.genres.map((item, index, array) => {
                                                return (index === array.length - 1) ? item.name : item.name + ', ';
                                            }).join('')}
                                        </span>
                                        <span>
                                            <bdi className='me-2'>&#9679;</bdi>
                                            {(() => {
                                                let minutes = details.runtime;
                                                var hours = Math.floor(minutes / 60);
                                                var remainingMinutes = minutes % 60;

                                                return hours + " h " + remainingMinutes + " m";
                                            })()}
                                        </span>
                                    </p>
                                    <div className='overview'>
                                        <h4>overview</h4>
                                        {details.overview}
                                    </div>
                                    <div className='other-info my-4'>
                                        <ul className='row p-0'>
                                            <div className='col-md-3'>
                                                <span className='fw-medium'>Status</span>
                                                <p>{details.status}</p>
                                            </div>
                                            <div className='col-md-3'>
                                                <span className='fw-medium'>Original Language</span>
                                                <p>{details.spoken_languages.map((item, index, array) => {
                                                    return (index === array.length - 1) ? item.name : item.name + ', ';
                                                })}</p>
                                            </div>
                                            <div className='col-md-3'>
                                                <span className='fw-medium'>Budget</span>
                                                <p>{details.budget != 0 ? details.budget : "-"}</p>
                                            </div>
                                            <div className='col-md-3'>
                                                <span className='fw-medium'>Revenue</span>
                                                <p>{details.revenue != 0 ? `$` + details.revenue : "-"}</p>
                                            </div>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
                :
                <div>
                    <h5>oops no data found!!</h5>
                </div>

            }


        </MainLayout>
    );
}

export default Recipe;