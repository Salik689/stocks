'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function ReturnItemsPage() {
  // Form fields
  const [name, setName] = useState('');
  const [aimsId, setAimsId] = useState('');
  const [shoba, setShoba] = useState('');

  // Stock and item selection
  const [stock, setStock] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback and return history
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allReturns, setAllReturns] = useState([]);

  useEffect(() => {
    fetchReturnItems();
    fetchStock();
  }, []);

  const fetchReturnItems = async () => {
    try {
      const res = await fetch('/api/returnItems');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      setAllReturns(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setAllReturns([]);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/getStock');
      const data = await res.json();
      setStock(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Stock fetch error:', err);
      setStock([]);
    }
  };

  const handleCheckbox = (itemId) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      if (itemId in updated) {
        delete updated[itemId];
      } else {
        updated[itemId] = 0;
      }
      return updated;
    });
  };

  const handleQuantityInput = (itemId, value) => {
    const item = stock.find(i => i._id === itemId);
    let qty = Number(value);
    if (isNaN(qty) || qty < 0) qty = 0;
    if (item && qty > item.itemQuantity) qty = item.itemQuantity;
    setSelectedItems(prev => ({ ...prev, [itemId]: qty }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const structuredItems = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = stock.find(i => i._id === id);
        return {
          itemId: id,
          itemName: item?.itemName || 'Unknown',
          taken: qty
        };
      });

    if (structuredItems.length === 0) {
      setError('Please select at least one item with quantity.');
      return;
    }

    try {
      const res = await fetch('/api/returnItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, aimsId, shoba, items: structuredItems }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save return items');

      setSuccess('Return items saved and stock updated!');
      setName('');
      setAimsId('');
      setShoba('');
      setSelectedItems({});
      setSearchQuery('');
      fetchReturnItems();
      fetchStock();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredReturns = allReturns.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      Array.isArray(item.items) &&
      item.items.some(i => i.itemName?.toLowerCase().includes(query)) ||
      item.shoba?.toLowerCase().includes(query)
    );
  });

  const filteredStock = stock.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
        <h1>📦 Return Items</h1>

        {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search items to return..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.5rem',
            marginBottom: '1rem',
            width: '100%',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />

        {/* 📝 Form */}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="AIMS ID" value={aimsId} onChange={(e) => setAimsId(e.target.value)} required />
          <input type="text" placeholder="Shoba" value={shoba} onChange={(e) => setShoba(e.target.value)} required />

          {/* 🔄 Filtered Item Selector */}
          <div>
            <h3>Select Items to Return</h3>
            {filteredStock.length > 0 ? (
              filteredStock.map(item => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedItems[item._id] !== undefined}
                    onChange={() => handleCheckbox(item._id)}
                  />
                  <span>{item.itemName}</span>
                  <input
                    type="number"
                    min={0}
                    max={item.itemQuantity}
                    disabled={selectedItems[item._id] === undefined}
                    value={selectedItems[item._id] ?? ''}
                    onChange={(e) => handleQuantityInput(item._id, e.target.value)}
                    style={{ width: '60px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    (Max: {item.itemQuantity})
                  </span>
                </div>
              ))
            ) : (
              <p>No matching items found.</p>
            )}
          </div>

          <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Submit Return
          </button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        {/* 📋 Return History Table */}
        <table style={{ marginTop: '2rem', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #000', textAlign: 'left', padding: '0.5rem' }}>Name</th>
              <th style={{ borderBottom: '2px solid #000', textAlign: 'left', padding: '0.5rem' }}>AIMS ID</th>
              <th style={{ borderBottom: '2px solid #000', textAlign: 'left', padding: '0.5rem' }}>Shoba</th>
              <th style={{ borderBottom: '2px solid #000', textAlign: 'left', padding: '0.5rem' }}>Items</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((returnItem) => (
                <tr key={returnItem._id}>
                  <td style={{ borderBottom: '1px solid #000', padding: '0.5rem' }}>{returnItem.name}</td>
                  <td style={{ borderBottom: '1px solid #000', padding: '0.5rem' }}>{returnItem.aimsId}</td>
                  <td style={{ borderBottom: '1px solid #000', padding: '0.5rem' }}>{returnItem.shoba}</td>
                  <td style={{ borderBottom: '1px solid #000', padding: '0.5rem' }}>
                    {Array.isArray(returnItem.items)
                      ? returnItem.items.map((i, idx) => (
                          <div key={idx}>
                            {i.itemName} — Taken: {i.taken}
                          </div>
                        ))
                      : returnItem.items}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>
                  No matching return items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}