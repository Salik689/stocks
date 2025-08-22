"use client";
import React, { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import './getItem.css';

const Page = () => {
    const [stock, setStock] = useState([]);
    const [selectedItems, setSelectedItems] = useState({}); // {itemId: quantityToRemove}
    const [search, setSearch] = useState("");
    const [departments, setDepartments] = useState([]);
    const { register, handleSubmit, watch, setValue } = useForm();

    useEffect(() => {
        const fetchStock = async () => {
            const res = await fetch("/api/getStock");
            const data = await res.json();
            setStock(data);
        };
        const fetchDepartments = async () => {
            const res = await fetch("/api/departments");
            const data = await res.json();
            setDepartments(data);
        };
        fetchStock();
        fetchDepartments();
    }, []);

    // Handle checkbox toggle
    const handleCheckbox = (itemId) => {
        setSelectedItems(prev => {
            if (Object.prototype.hasOwnProperty.call(prev, itemId)) {
                // Unselect: remove from selected
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            } else {
                // Select: add with initial quantity 0
                return { ...prev, [itemId]: 0 };
            }
        });
    };

    // Handle direct input for each selected item
    const handleQuantityInput = (itemId, value) => {
        setSelectedItems(prev => {
            const item = stock.find(i => i._id === itemId);
            let newValue = Number(value);
            if (isNaN(newValue) || newValue < 0) newValue = 0;
            if (item && newValue > item.itemQuantity) newValue = item.itemQuantity;
            return { ...prev, [itemId]: newValue };
        });
    };

    // Handle Done: update all selected items in DB (PDF logic removed)
    const handleDone = async () => {
        const shobaValue = watch("shoba");
        const nameDetailsValue = watch("nameDetails");
        const aimsIdValue = watch("aimsId");
        const items = Object.entries(selectedItems)
            .filter(([id, qty]) => qty > 0)
            .map(([id, qty]) => ({
                id,
                change: -qty,
                taken: qty
            }));

        // Update stock only
        await fetch("/api/update-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items,
                done: true,
                shoba: shobaValue,
                nameDetails: nameDetailsValue,
                aimsId: aimsIdValue
            })
        });

        // Refresh stock and reset
        const req = await fetch("/api/getStock");
        const updatedStock = await req.json();
        setStock(updatedStock);
        setSelectedItems({});
        alert("✅ Saved successfully, email sent");
    };

    return (
        <>
            <div className="saveNav">
                <button
                    className="done"
                    type="button"
                    onClick={handleDone}
                    disabled={Object.values(selectedItems).every(qty => qty === 0)}>
                    ✅ Save all
                </button>
            </div>
            <div className="getItemsPage" >
                <form>
                    <div className="details">
                        <div className="input">
                            <label htmlFor="shoba">Shoba</label>
                            <select
                                name="shoba"
                                id="shoba"
                                {...register("shoba", { required: "Please select Shoba" })}
                                defaultValue=""
                            >
                                <option value="" disabled>Select Shoba</option>
                                {departments.map((dept, idx) => (
                                    <option key={idx} value={dept.department}>{dept.department}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input">
                            <label htmlFor="nameDetails">Name</label>
                            <input type="text" placeholder='Enter your name' name='nameDetails' id='nameDetails' {...register("nameDetails", {
                                required: "Please enter name",
                            })} />
                        </div>
                        <div className="input">
                            <label htmlFor="aimsId">Aims Id</label>
                            <input type="text" placeholder='Enter aimsId' name='aimsId' id='aimsId' {...register("aimsId", {
                                required: "Please enter Aims Id",
                            })} />
                        </div>
                    </div>
                    <div className="searchBar">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="listOFitems" >
                        {search.trim() === "" ? null : (
                            Array.isArray(stock) && stock.length > 0 ? (
                                stock.filter(item =>
                                    item.itemName && item.itemName.toLowerCase().includes(search.toLowerCase())
                                ).length > 0 ? (
                                    stock.filter(item =>
                                        item.itemName && item.itemName.toLowerCase().includes(search.toLowerCase())
                                    ).map((item, idx) => (
                                        <div className="item" key={item._id || idx}>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems[item._id] !== undefined}
                                                onChange={() => handleCheckbox(item._id)}
                                            />
                                            <span>{item.itemName}</span>
                                            <div className="changeQuantity">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={item.itemQuantity}
                                                    disabled={selectedItems[item._id] === undefined}
                                                    value={selectedItems[item._id] !== undefined ? selectedItems[item._id] : ""}
                                                    onChange={e => handleQuantityInput(item._id, e.target.value)}
                                                    style={{ width: "60px", marginRight: "10px" }}
                                                />
                                                <span style={{ fontSize: "12px", color: "#888" }}>
                                                    (Max: {item.itemQuantity})
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>No items found</div>
                                )
                            ) : null
                        )}
                    </div>
                    <button
                        className="done"
                        type="button"
                        onClick={handleDone}
                        disabled={Object.values(selectedItems).every(qty => qty === 0)}>
                        ✅ Save all
                    </button>
                </form>
            </div>
        </>
    );
}

export default Page;