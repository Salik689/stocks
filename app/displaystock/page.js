"use client";
import './displayStock.css';
import React, { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
const DisplayStock = () => {
    const [stock, setStock] = useState([]);

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
    return (
        <div className="stockBlocksPage">
            <Navbar/>
            {Array.isArray(stock) && stock.length > 0
                ? stock.map((item, idx) => (
                    <div key={idx} className="stockBlock">
                        <ul>
                            <li>Item Name: <span>{item.itemName}</span></li>
                            <li>Quantity: <span>{item.itemQuantity}</span></li>
                            <li>Location: <span>{item.itemLocation}</span></li>
                        </ul>
                        <div className="changeQuantity">
                            <button onClick={() => handleChangeQuantity(item._id, 1)}>+</button>
                            <button onClick={() => handleChangeQuantity(item._id, -1)}>-</button>
                          
                        </div>
                    </div>
                ))
                : <li>No items found.</li>
            }
        </div>
    );
};

export default DisplayStock;