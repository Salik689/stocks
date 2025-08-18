"use client";
import './getItem.css'
import React, { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';

const Page = () => {
    const [stock, setStock] = useState([]);
    const [currentQuantity, setcurrentQuantity] = useState(0);
    const {
        register,
        handleSubmit,
        watch,
    } = useForm();

    useEffect(() => {
        const fetchStock = async () => {
            const res = await fetch("/api/getStock");
            const data = await res.json();
            setStock(data);
        };
        fetchStock();
    }, []);

    const selectedItemId = watch("selectedItemId");
    const selectedItem = Array.isArray(stock) ? stock.find(item => item._id === selectedItemId) : undefined;

    // Reset local count when selecting new item
    useEffect(() => {
        setcurrentQuantity(0);
    }, [selectedItemId]);

    // Just update LOCAL quantity (+/-), not DB yet
    const handleChangeQuantity = (change) => {
        if (change === -1 && currentQuantity === 0) return; // prevent < 0
        if (change === 1 && selectedItem && selectedItem.itemQuantity === 0) return; // no stock left
        setcurrentQuantity(prev => Math.max(0, prev + change));
    };

    // "Done" button → save changes to DB + send notification
    const handleSave = async () => {
        const shobaValue = watch("shoba");

        if (!selectedItemId || currentQuantity === 0) {
            alert("⚠️ Nothing to save");
            return;
        }

        const res = await fetch("/api/update-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedItemId,
                change: -currentQuantity,
                done: true,
                shoba: shobaValue // send shoba value to backend
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert("✅ Quantity saved & notification sent!");

            // Refresh stock after saving
            const req = await fetch("/api/getStock");
            const updatedStock = await req.json();
            setStock(updatedStock);

            setcurrentQuantity(0); // reset
        } else {
            alert("❌ Failed to save: " + data.error);
        }
    };

    return (
        <div className="checkItem">
            <form>
                <div className="input">
                    <label htmlFor="shoba">Shoba</label>
                    <input type="text" placeholder='Enter Shoba' name='shoba' id='shoba' {...register("shoba", {
                        required: "Please enter Shoba",
                    })} />
                </div>
                <div className="input">
                    <label htmlFor="selectedItemId">Please select an item</label>
                    <select {...register("selectedItemId")}>
                        <option value="">-- Please select --</option>
                        {Array.isArray(stock) && stock.length > 0
                            ? stock.map((item, idx) => (

                                <option key={item._id || idx} value={item._id}>
                                    {item.itemName}
                                </option>
                            ))
                            : <option>No items found</option>
                        }
                    </select>
                </div>
            </form>

            <div className="quantity">
                Quantity: {currentQuantity}
            </div>
            <div className="changeQuantity">
                <button onClick={() => handleChangeQuantity(1)}> <img src="/images/plus.gif" width={30} height={30} alt="" /> </button>
                <button onClick={() => handleChangeQuantity(-1)}><img src="/images/minus.gif" width={30} height={30} alt="" /></button>
            </div>

            <button className='done' type="button" onClick={handleSave} disabled={!selectedItemId}>✅ Done</button>

        </div>
    );
}

export default Page;
