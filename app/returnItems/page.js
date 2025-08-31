'use client';
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import './returnItems.css'; // Make sure this file exists
import Navbar from '../components/Navbar';

const Page = () => {
  // State for stock items and departments
  const [stock, setStock] = useState([]);
  const [departments, setDepartments] = useState([]);

  // State for selected items and quantities
  const [selectedItems, setSelectedItems] = useState({});

  // UI feedback and form state
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demandNumber, setDemandNumber] = useState(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  // Fetch stock and department data on mount
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

  // Toggle item selection
  const handleCheckbox = (itemId) => {
    setSelectedItems(prev => {
      if (Object.prototype.hasOwnProperty.call(prev, itemId)) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      } else {
        return { ...prev, [itemId]: 0 };
      }
    });
  };

  // Handle quantity input per item
  const handleQuantityInput = (itemId, value) => {
    setSelectedItems(prev => {
      const item = stock.find(i => i._id === itemId);
      let newValue = Number(value);
      if (isNaN(newValue) || newValue < 0) newValue = 0;
      return { ...prev, [itemId]: newValue };
    });
  };

  // Submit return form
  const handleReturn = async () => {
    setLoading(true);
    setSuccess(false);

    // Use customShoba if provided, otherwise fallback to dropdown
    const shobaValue = watch("customShoba")?.trim() || watch("shoba");
    const nameDetailsValue = watch("nameDetails");
    const aimsIdValue = watch("aimsId");

    // Prepare item payload
    const items = Object.entries(selectedItems)
      .filter(([id, qty]) => qty > 0)
      .map(([id, qty]) => ({
        id,
        change: qty,       // Add quantity back to stock
        returned: qty      // Optional: for backend clarity
      }));

    try {
      const res = await fetch("/api/update-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          action: "return",
          shoba: shobaValue,
          nameDetails: nameDetailsValue,
          aimsId: aimsIdValue
        })
      });

      const result = await res.json();
      setDemandNumber(result.dimandNumber); // Display reference number
      const req = await fetch("/api/getStock");
      const updatedStock = await req.json();
      setStock(updatedStock);
      setSelectedItems({});
      setSuccess(true);
    } catch (err) {
      console.error("Error saving return:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Top Save Button */}
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

      {/* Success Message */}
      {success && (
        <div className="success" style={{ color: "green", textAlign: "center", margin: "10px 0" }}>
          ✅ Items returned successfully! Reference Number: <b>{demandNumber}</b>
        </div>
      )}

      {/* Main Form */}
      <div className="getItemsPage">
        <form id="return-items-form" onSubmit={handleSubmit(handleReturn)}>
          <div className="details">
            {/* Dropdown for Shoba */}
            <div className="input">
              <label htmlFor="shoba">Shoba (select or enter manually)</label>
              <select
                name="shoba"
                id="shoba"
                {...register("shoba")}
                defaultValue=""
              >
                <option value="">Select Shoba</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept.department}>{dept.department}</option>
                ))}
              </select>
            </div>

            {/* Manual Shoba Input */}
            <div className="input">
              <label htmlFor="customShoba">Or enter Shoba manually</label>
              <input
                type="text"
                placeholder="Enter custom Shoba"
                {...register("customShoba")}
              />
            </div>

            {/* Validation: Require one of the two */}
            {!watch("shoba") && !watch("customShoba") && (
              <span style={{ color: 'red' }}>Please select or enter a Shoba</span>
            )}

            {/* Name Input */}
            <div className="input">
              <label htmlFor="nameDetails">Name</label>
              <input
                type="text"
                placeholder='Enter your name'
                {...register("nameDetails", { required: "Please enter your name" })}
              />
              {errors.nameDetails && <span style={{ color: 'red' }}>{errors.nameDetails.message}</span>}
            </div>

            {/* AIMS ID Input */}
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

          {/* Search Bar */}
          <div className="searchBar">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filtered Item List */}
          <div className="listOFitems">
            {search.trim() === "" ? null : (
              Array.isArray(stock) && stock.length > 0 ? (
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
                        max={item.itemQuantity + 1000} // Optional: allow returns beyond current stock
                        disabled={selectedItems[item._id] === undefined}
                        value={selectedItems[item._id] !== undefined && selectedItems[item._id] !== 0 ? selectedItems[item._id] : ""}
                        onChange={e => handleQuantityInput(item._id, e.target.value)}
                        style={{ width: "60px", marginRight: "10px" }}
                      />
                      <span style={{ fontSize: "12px", color: "#888" }}>
                        (Returning)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div>No items found</div>
              )
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default Page;