"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function StocksPage() {
    const [role, setRole] = useState("");

    return (
        <div>
             <Navbar isAdmin={role === "admin"} />
            <input
                type="text"
                placeholder="Enter role"
                value={role}
                onChange={e => setRole(e.target.value)}
            />
           
            {/* ...rest of your stocks page... */}
        </div>
    );
}