import React from 'react';
import { Link } from 'react-router-dom';

function Header(props) {
    return (
        <header className='container-fluid header-bg'>

            <div className='container h-100'>
                <div className='row h-100 align-items-center'>
                    <div className='col-6'>
                        <div className='logodiv-main'>
                            <Link to="/">
                                <h1>Movie</h1>
                            </Link>
                        </div>

                    </div>
                    <div className='col-6'>
                        <Link to="/watchlist">

                            <div className='text-end'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                                    <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>


        </header>
    );
}

export default Header;