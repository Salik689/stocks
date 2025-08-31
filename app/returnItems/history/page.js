'use client';
import React, { useEffect, useState } from 'react';
import '../returnItems.css';
import Navbar from '../../components/Navbar';

const HistoryPage = () => {
  const [returnedItems, setReturnedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter logic based on search query
  const filteredItems = returnedItems.filter(entry => {
    const query = searchQuery.toLowerCase();
    const shobaMatch = entry.shoba?.toLowerCase().includes(query);
    const itemMatch = Array.isArray(entry.items)
      ? entry.items.some(i => i.itemName?.toLowerCase().includes(query))
      : false;
    return shobaMatch || itemMatch;
  });

  return (
    <>
      <Navbar />
      <div className="returnedItemsTable">
        <h2>📋 Returned Items History</h2>

        {/* Search Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by item name or shoba..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem',
              width: '100%',
              maxWidth: '400px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

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
            {filteredItems.length > 0 ? (
              filteredItems.map((entry, idx) => (
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
                  No matching records found.
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