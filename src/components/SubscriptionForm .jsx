import React, { useState } from 'react';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const SubscriptionForm  = () => {
  const [planType, setPlanType] = useState('individual');
  const [frequency, setFrequency] = useState('monthly');
  const [groupSize, setGroupSize] = useState(1);

  const handleCheckout = async () => {
    const res = await fetch(`${url}/createCheckoutSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType, frequency, groupSize }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div>
      <select value={planType} onChange={(e) => setPlanType(e.target.value)}>
        <option value="individual">Individual</option>
        <option value="group">Group</option>
      </select>

      {planType === 'group' && (
        <input
          type="number"
          min="1"
          placeholder="Group Size"
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
        />
      )}

      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
};

export default SubscriptionForm ;
