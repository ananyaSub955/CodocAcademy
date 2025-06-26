import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const UserDashboard = () => {
    const [userId, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${url}/session`, { credentials: "include" })
            .then(async (response) => {
                if (!response.ok) {
                    // Not logged in
                    console.log("No session found");
                    navigate("/login"); // don't forget to import navigate!
                    return;
                }
                const data = await response.json();
                setUser(data); // data should contain: { id, email, firstName }
            })
            .catch(error => {
                console.error("Error fetching session:", error);
            });
    }, []);



    return (
        <div>
            <h1>Hello {userId?.firstName}</h1>
        </div>
    )
}

export default UserDashboard