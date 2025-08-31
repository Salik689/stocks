'use client';
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import './returnItems.css';
import Navbar from '../components/Navbar';

const Page = () => {
  const [stock, setStock] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [returnedItems, setReturnedItems] = useState([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

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

    const fetchReturnedItems = async () => {
      try {
        const res = await fetch("/api/returnItems");
        const data = await res.json();
        setReturnedItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching returned items:", err);
        setReturnedItems([]);
      }
    };

    fetchStock();
    fetchDepartments();
    fetchReturnedItems();
  }, []);

  const handleCheckbox = (itemId) => {
    setSelectedItems(prev => {
      if (itemId in prev) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      } else {
        return { ...prev, [itemId]: 0 };
      }
    });
  };

  const handleQuantityInput = (itemId, value) => {
    const qty = Math.max(0, Number(value));
    setSelectedItems(prev => ({ ...prev, [itemId]: qty }));
  };

  const handleReturn = async () => {
    setLoading(true);
    setSuccess(false);

    const shobaValue = watch("customShoba")?.trim() || watch("shoba");
    const nameDetailsValue = watch("nameDetails");
    const aimsIdValue = watch("aimsId");

    const items = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        itemId: id,
        itemName: stock.find(i => i._id === id)?.itemName || "Unknown",
        returned: qty
      }));

    try {
      await fetch("/api/returnItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameDetailsValue,
          aimsId: aimsIdValue,
          shoba: shobaValue,
          items
        })
      });

      const updatedStock = await (await fetch("/api/getStock")).json();
      setStock(updatedStock);
      setSelectedItems({});
      setSuccess(true);

      const updatedReturns = await (await fetch("/api/returnItems")).json();
      setReturnedItems(Array.isArray(updatedReturns) ? updatedReturns : []);
    } catch (err) {
      console.error("Error saving return:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="saveNav">
        {!success && (
          <button
            className="done"
            type="submit"
            form="return-items-form"
            disabled={Object.values(selectedItems).every(qty => qty === 0) || loading}
          >
            🔄 Return Items
          </button>
        )}
      </div>

      {success && (
        <div className="success">
          ✅ Items returned successfully!
        </div>
      )}

      <div className="getItemsPage">
        <form id="return-items-form" onSubmit={handleSubmit(handleReturn)}>
          <div className="details">
            <div className="input">
              <label htmlFor="shoba">Shoba (select or enter manually)</label>
              <select id="shoba" {...register("shoba")} defaultValue="">
                <option value="">Select Shoba</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept.department}>{dept.department}</option>
                ))}
              </select>
            </div>

            <div className="input">
              <label htmlFor="customShoba">Or enter Shoba manually</label>
              <input
                type="text"
                placeholder="Enter custom Shoba"
                {...register("customShoba")}
              />
            </div>

            {!watch("shoba") && !watch("customShoba") && (
              <span style={{ color: 'red' }}>Please select or enter a Shoba</span>
            )}

            <div className="input">
              <label htmlFor="nameDetails">Name</label>
              <input
                type="text"
                placeholder='Enter your name'
                {...register("nameDetails", { required: "Please enter your name" })}
              />
              {errors.nameDetails && <span style={{ color: 'red' }}>{errors.nameDetails.message}</span>}
            </div>

            <div className="input">
              <label htmlFor="aimsId">AIMS ID</label>
              <input
                type="text"
                placeholder='Enter AIMS ID'
                {...register("aimsId", {
                  required: "Please enter your AIMS ID",
                  pattern: {
                    value: /^\d{1,5}$/,
                    message: "AIMS ID must be a number with up to 5 digits"
                  }
                })}
              />
              {errors.aimsId && <span style={{ color: 'red' }}>{errors.aimsId.message}</span>}
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

          <div className="listOFitems">
            {search.trim() === "" ? null : (
              stock.filter(item =>
                item.itemName?.toLowerCase().includes(search.toLowerCase())
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
                      max={item.itemQuantity + 1000}
                      disabled={selectedItems[item._id] === undefined}
                      value={selectedItems[item._id] ?? ""}
                      onChange={e => handleQuantityInput(item._id, e.target.value)}
                    />
                    <span>(Returning)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </form>

        <div className="returnedItemsTable">
          <h2>📋 Returned Items History</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>AIMS ID</th>
                <th>Shoba</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {returnedItems.length > 0 ? (
                returnedItems.map((entry, idx) => (
                  <tr key={entry._id || idx}>
                    <td>{entry.nameDetails || entry.name}</td>
                    <td>{entry.aimsId}</td>
                    <td>{entry.shoba}</td>
                    <td>
                      {Array.isArray(entry.items)
                        ? entry.items.map((i, iIdx) => (
                            <div key={iIdx}>
                              {i.itemName} — Returned: {i.returned || i.taken}
                            </div>
                          ))
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No return records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Page;