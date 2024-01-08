import React from 'react';
import Footer from './Footer';
import Header from './Header';

function MainLayout(props) {
    return (
        <>
            <Header />
            {props.children}
            {/* <Footer /> */}
        </>
    );
}

export default MainLayout;