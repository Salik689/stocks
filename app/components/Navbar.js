"use client";
import React from 'react'
import Link from 'next/link'
import './Navbar.css'

const Navbar = ({ }) => {
    return (
        <nav>
            <div className="logo">
                <img src="images/jalsaLogo.png" width={50} alt="" />
            </div>
            <ul>


                <Link href={"/getItem"}><li>Get items</li></Link>


                <Link href={"/"}><li>Add item</li></Link>
                <Link href={"/displaystock"}><li>Display Stock</li></Link>


            </ul>
        </nav>
    )
}

export default Navbar