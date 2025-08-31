'use client';
import React, { useEffect, useState } from 'react';
import '../returnItems.css'; // ✅ Correct path
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
              <th scope="col">Name</th>
              <th scope="col">AIMS ID</th>
              <th scope="col">Shoba</th>
              <th scope="col">Items</th>
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
                    {Array.isArray(entry.items) ? (
                      <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {entry.items.map((i, iIdx) => (
                          <li key={iIdx}>
                            {i.itemName} — Returned: {i.returned}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      entry.items
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>
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