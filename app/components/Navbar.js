"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./Navbar.css";


export default function Navbar() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <header className="site-header">
            <div className="logo">
                <Link href="/" onClick={close}>
                    <img src="images/jalsaLogo.png" width={50} alt="" />
                </Link>
            </div>

            <button
                className={`menu-toggle ${open ? "is-open" : ""}`}
                aria-expanded={open}
                aria-controls="mobileNav"
                onClick={() => setOpen((v) => !v)}
            >
                {!open ? (
                    <Image src="/images/openMenu.gif" width={50} height={50} alt="Open menu" />
                ) : (
                    <Image src="/images/closeMenu.gif" width={50} height={50} alt="Close menu" />
                )}
            </button>

            {/* Slide-over panel */}
            <nav id="mobileNav" className={`mobile-nav ${open ? "nav-open" : "nav-closed"}`}>
                <ul>
                    <Link href={"/getItem"}><li>Get items</li></Link>
                    <Link href={"/"}><li>Add item</li></Link>
                    <Link href={"/displaystock"}><li>Display Stock</li></Link>
                    <Link href={"/demand"}><li>Demand</li></Link>
                    <Link href={"/change"}><li>Submitions</li></Link>


                </ul>
            </nav>

            {/* Backdrop for outside click */}
            {open && (
                <button
                    className="backdrop"
                    aria-label="Close menu"
                    onClick={close}
                />
            )}
        </header>
    );
}
