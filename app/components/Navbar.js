"use client";
import React from 'react'
import Link from 'next/link'
import './Navbar.css'

const Navbar = ({ isAdmin }) => {
    return (
         <nav>
            <ul>
                {/* Show these links only if user is admin */}
                {isAdmin && (
                    <>
                        <Link href={"/"}><li>Add item</li></Link>
                        <Link href={"/displaystock"}><li>Display Stock</li></Link>
                    </>
                )}
                {/* Stocks link always visible */}
                <Link href={"/stocks"}><li>Stocks</li></Link>
                {/* Get items link always visible */}
                <Link href={"/getItem"}><li>Get items</li></Link>
            </ul>
        </nav>
    )
}

export default Navbar