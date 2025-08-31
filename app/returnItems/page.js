'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function ReturnItemsPage() {
  const [name, setName] = useState('');
  const [aimsId, setAimsId] = useState('');
  const [shoba, setShoba] = useState('');
  const [items, setItems] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allReturns, setAllReturns] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 Search input

  useEffect(() => {
    fetchReturnItems();
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/returnItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, aimsId, shoba, items }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save return items');

      setSuccess('Return items saved!');
      setName('');
      setAimsId('');
      setShoba('');
      setItems('');
      fetchReturnItems();
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔍 Filter logic based on search query
  const filteredReturns = allReturns.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.items?.toLowerCase().includes(query) ||
      item.shoba?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
        <h1>📦 Return Items</h1>

        {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search by item name or shoba..."
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
          <textarea
            placeholder="Items for Return"
            value={items}
            onChange={(e) => setItems(e.target.value)}
            required
            style={{ minHeight: '100px' }}
          />
          <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Submit Return
          </button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        {/* 📋 Table */}
        <table style={{ marginTop: '2rem', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #000000ff', textAlign: 'left', padding: '0.5rem' }}>Name</th>
              <th style={{ borderBottom: '2px solid #000000ff', textAlign: 'left', padding: '0.5rem' }}>AIMS ID</th>
              <th style={{ borderBottom: '2px solid #000000ff', textAlign: 'left', padding: '0.5rem' }}>Shoba</th>
              <th style={{ borderBottom: '2px solid #000000ff', textAlign: 'left', padding: '0.5rem' }}>Items</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((returnItem) => (
                <tr key={returnItem._id}>
                  <td style={{ borderBottom: '1px solid #000000ff', padding: '0.5rem' }}>{returnItem.name}</td>
                  <td style={{ borderBottom: '1px solid #000000ff', padding: '0.5rem' }}>{returnItem.aimsId}</td>
                  <td style={{ borderBottom: '1px solid #000000ff', padding: '0.5rem' }}>{returnItem.shoba}</td>
                  <td style={{ borderBottom: '1px solid #000000ff', padding: '0.5rem' }}>{returnItem.items}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No matching return items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}