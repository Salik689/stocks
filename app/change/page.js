"use client";
import React, { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import "./change.css";

const ChangePage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [nextDimandNumber, setNextDimandNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch submissions
        const res = await fetch("/api/get-submissions");
        if (!res.ok) throw new Error("Failed to fetch submissions");
        const data = await res.json();
        setSubmissions(data);

        // 2️⃣ Fetch latest dimand number from counters collection
        const counterRes = await fetch("/api/dimandnumber");
        if (counterRes.ok) {
          const counterData = await counterRes.json();
          // Show the next available dimand number (current count + 1)
          setNextDimandNumber(counterData.dimandNumber ?? null);
        } else {
          setNextDimandNumber(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Filter submissions based on search query
  const filteredSubmissions = submissions.filter(sub =>
    sub.shoba && sub.shoba.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="submitionsPage" style={{ padding: "20px" }}>
        <h2>Submissions</h2>
        <div style={{ marginBottom: "16px", fontWeight: "bold" }}>
          Dimand Number: {nextDimandNumber !== null ? nextDimandNumber : "-"}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by Shoba..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        {filteredSubmissions.length === 0 ? (
          <div>No submissions found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>

                <th>Shoba</th>
                <th>Name</th>
                <th>Aims Id</th>
                <th>Date</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub, idx) => (
                <tr key={sub._id || idx}>

                  <td>{sub.shoba}</td>
                  <td>{sub.nameDetails}</td>
                  <td>{sub.aimsId}</td>
                  <td>{sub.createdAt ? new Date(sub.createdAt).toLocaleString() : ""}</td>
                  <td>
                    <ul>
                      {(sub.updatedItems || []).map((item, i) => (
                        <li key={i}>
                          {item.itemName} (Taken: {item.taken}, Left: {item.itemQuantity})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ChangePage;
