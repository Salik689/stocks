'use client';
import React, { useEffect, useState } from 'react';
import '../../returnItems.css'; // Adjust path if needed
import Navbar from '../../components/Navbar';

const HistoryPage = () => {
  const [returnedItems, setReturnedItems] = useState([]);

  useEffect(() => {
    const fetchReturnedItems = async () => {
      try {
        const res = await fetch("/api/returnItems");
        const data = await res.json();
        setReturnedItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching return history:", err);
        setReturnedItems([]);
      }
    };

    fetchReturnedItems();
  }, []);

  return (
    <>
      <Navbar />
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
                            {i.itemName} — Returned: {i.returned}
                          </div>
                        ))
                      : entry.items}
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
    </>
  );
};

export default HistoryPage;