"use client";
import './displayStock.css';
import React, { useEffect, useState } from "react";
import Navbar from '../components/Navbar';

const DisplayStock = () => {
    const [stock, setStock] = useState([]);
    const [search, setSearch] = useState("");
    const [editQuantities, setEditQuantities] = useState({});
    const [editLocations, setEditLocations] = useState({}); // NEW: Track edited locations

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        const res = await fetch("/api/getStock");
        const data = await res.json();
        setStock(data);
    };

    // Handle input change for quantity
    const handleQuantityInput = (id, value) => {
        setEditQuantities(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Handle input change for location
    const handleLocationInput = (id, value) => {
        setEditLocations(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Save new quantity to backend
    const handleSaveQuantity = async (id) => {
        const newQuantity = Number(editQuantities[id]);
        if (isNaN(newQuantity)) return;
        const currentItem = stock.find(i => i._id === id);
        const change = newQuantity - (currentItem?.itemQuantity || 0);

        await fetch("/api/update-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, change })
        });

        await fetchStock();
        setEditQuantities(prev => ({ ...prev, [id]: "" }));
    };

    // Save new location to backend
    const handleSaveLocation = async (id) => {
        const newLocation = editLocations[id];
        if (!newLocation) return;

        await fetch("/api/update-location", { // You need to create this API route!
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, newLocation })
        });

        await fetchStock();
        setEditLocations(prev => ({ ...prev, [id]: "" }));
    };

    const handleDeleteItem = async (id) => {
        await fetch("/api/delete-item", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        await fetchStock();
    };

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
                style={{
                    margin: "20px",
                    padding: "10px",
                    borderRadius: "8px",
                    width: "300px"
                }}
            />
            <div className="stock">
            {filteredStock.length > 0 ? (
                filteredStock.map((item, idx) => (
                    <div key={item._id || idx} className="stockBlock">
                        <ul>
                            <li>
                                Item Name: <span>{item.itemName}</span>
                            </li>
                            <li>
                                Current Quantity: <span>{item.itemQuantity}</span>
                            </li>
                            <li>
                                <input
                                    type="number"
                                    value={editQuantities[item._id] ?? ""}
                                    placeholder="Set new quantity"
                                    onChange={e => handleQuantityInput(item._id, e.target.value)}
                                    style={{ width: "134px", marginRight: "10px" }}
                                />
                                <button
                                    onClick={() => handleSaveQuantity(item._id)}
                                    disabled={
                                        editQuantities[item._id] === undefined ||
                                        editQuantities[item._id] === "" ||
                                        Number(editQuantities[item._id]) === item.itemQuantity
                                    }
                                >
                                    Save
                                </button>
                            </li>
                            <li>
                                Location: <span>{item.itemLocation}</span>
                            </li>
                            <li>
                                <input
                                    type="text"
                                    value={editLocations[item._id] ?? ""}
                                    placeholder="Set new location"
                                    onChange={e => handleLocationInput(item._id, e.target.value)}
                                    style={{ width: "140px", marginRight: "10px" }}
                                />
                                <button
                                    onClick={() => handleSaveLocation(item._id)}
                                    disabled={
                                        editLocations[item._id] === undefined ||
                                        editLocations[item._id] === "" ||
                                        editLocations[item._id] === item.itemLocation
                                    }
                                >
                                    Save
                                </button>
                            </li>
                            <li>
                                Number: <span>{item.number}</span>
                            </li>
                        </ul>
                        <div className="delete">
                            <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="deleteBtn"
                            >
                                <img src="/images/trash.gif" width={20} height={20} alt="Delete" />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <li>No items found.</li>
            )}
            </div>
        </div>
    );
};

export default DisplayStock;