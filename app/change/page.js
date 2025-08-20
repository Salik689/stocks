"use client";
import React, { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
const ChangePage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await fetch("/api/get-submissions"); // make sure this endpoint exists in your backend
                if (!res.ok) throw new Error("Failed to fetch submissions");
                const data = await res.json();
                setSubmissions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions(); // <-- call it here
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <Navbar />
            <div style={{ padding: "20px" }}>
                <h2>Submissions</h2>
                {submissions.length === 0 ? (
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
                            {submissions.map((sub, idx) => (
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
