'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
export default function NotesPage() {
  const [shoba, setShoba] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allNotes, setAllNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();

      // Defensive check: ensure it's an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setAllNotes(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setAllNotes([]); // Prevent crash
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shoba, notes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save note');

      setSuccess('Note saved!');
      setShoba('');
      setNotes('');
      fetchNotes(); // Refresh notes
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
    <Navbar />
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>📝 Notes</h1>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Shoba"
          value={shoba}
          onChange={(e) => setShoba(e.target.value)}
          required
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
          style={{ minHeight: '100px' }}
        />
        <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Note
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <table style={{ marginTop: '2rem', width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr>
      <th style={{ borderBottom: '2px solid #000000ff', textAlign: 'left', padding: '0.5rem' }}>Shoba</th>
      <th style={{ borderBottom: '2px solid #000000ff', textAlign: 'left', padding: '0.5rem' }}>Note</th>
    </tr>
  </thead>
  <tbody>
    {Array.isArray(allNotes) && allNotes.length > 0 ? (
      allNotes.map((note) => (
        <tr key={note._id}>
          <td style={{ borderBottom: '1px solid #000000ff', padding: '0.5rem' }}>{note.shoba}</td>
          <td style={{ borderBottom: '1px solid #000000ff', padding: '0.5rem' }}>{note.notes}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="2" style={{ padding: '1rem', textAlign: 'center' }}>No notes found.</td>
      </tr>
    )}
  </tbody>
</table>

    </div>
    </>
  );
}