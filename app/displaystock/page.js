"use client";
import './displayStock.css';
import React, { useEffect, useState } from "react";
import Navbar from '../components/Navbar';

const DisplayStock = () => {
    const [stock, setStock] = useState([]);
    const [search, setSearch] = useState(""); // Add search state

    useEffect(() => {
        const getStock = async () => {
            const req = await fetch("/api/getStock");
            const data = await req.json();
            setStock(data);
            console.log(data);
        };
        getStock();
    }, []);

    const handleChangeQuantity = async (id, change) => {
        await fetch("/api/update-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, change })
        });

        // Refresh stock after update
        const req = await fetch("/api/getStock");
        const data = await req.json();
        setStock(data);
    };

    const handleDeleteItem = async (id) => {
        await fetch("/api/delete-item", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });

        // Refresh stock after deletion
        const req = await fetch("/api/getStock");
        const data = await req.json();
        setStock(data);
    };

    // Filter items by search
    const filteredStock = Array.isArray(stock)
        ? stock.filter(item =>
            item.itemName?.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    return (
        <div className="stockBlocksPage">
            <Navbar />
            <input
                type="text"
                placeholder="Search item by name"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ margin: "20px", padding: "10px", borderRadius: "8px", width: "300px" }}
            />
            {filteredStock.length > 0
                ? filteredStock.map((item, idx) => (
                    <div key={idx} className="stockBlock">
                        <ul>
                            <li>Item Name: <span>{item.itemName}</span></li>
                            <li>Quantity: <span>{item.itemQuantity}</span></li>
                            <li>Location: <span>{item.itemLocation}</span></li>
                            <li>Number: <span>{item.number}</span></li>
                        </ul>
                        <div className="changeQuantity">
                            <button onClick={() => handleChangeQuantity(item._id, 1)}> <img src="/images/plus.gif" width={30} height={30} alt="" /> </button>
                            <button onClick={() => handleChangeQuantity(item._id, -1)}><img src="/images/minus.gif" width={30} height={30} alt="" /></button>
                        </div>
                        <div className="delete">
                            <button onClick={() => handleDeleteItem(item._id)} className="deleteBtn"><img src="/images/trash.gif" width={20} height={20} alt="" /></button>
                        </div>
                    </div>
                ))
                : <li>No items found.</li>
            }
        </div>
    );
};

export default DisplayStock;