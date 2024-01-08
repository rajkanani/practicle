import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useSearchParams } from 'react-router-dom';
import { APIKEY, APIURL } from '../const';
import Recipe from './Common/Recipe';
import MainLayout from './Layout/MainLayout';

function Search(props) {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('query');
    const [query, setQuery] = useState(initialQuery);
    const [data, setdata] = useState([]);
    const [pageCount, setpageCount] = useState(0)
    const [page, setpage] = useState(1)



    const searchRecipe = (value) => {
        setQuery(value && value != "" ? value : null)
    }

    async function searchfromapi(query) {
        const apiUrl = `${APIURL}search/movie?api_key=${APIKEY}&query=${query}&page=${page}`;
        let search_data = await axios.get(apiUrl)
        setdata(search_data.data.results)
        setpageCount(search_data.data.total_pages)
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchfromapi(query)
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [query, page])


    const handlePageClick = (e) => {
        setpage(e.selected + 1)
    }


    return (
        <MainLayout>
            <section className='container-fluid search-sticky-top'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='search-top-main position-relative'>
                                <input
                                    type="search"
                                    className='form-control'
                                    value={query}
                                    onChange={(e) => searchRecipe(e.target.value)}
                                />
                                <div className='search-icn'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" fill='#000' />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className='container common-section'>
                <div className='row movie-section'>
                    <Recipe data={data} />

                    {pageCount > 1 &&

                        <div className='cust-pagination'>
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel=">"
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={1}
                                pageCount={pageCount}
                                previousLabel="<"
                                renderOnZeroPageCount={null}
                                className={"custom-pagi-info "}
                            />
                        </div>
                    }
                </div>
            </section>
        </MainLayout>
    );
}

export default Search;
