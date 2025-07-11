import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import StripeCheckout from 'react-stripe-checkout';

const Dispute = () => {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [truth, setTruth] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchDispute = async () => {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/dispute/${id}`, { headers: { Authorization: token } });
      const data = await res.json();
      setDispute(data);
    };
    fetchDispute();
  }, [id]);

  const join = async () => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`http://localhost:5000/join/${id}`, { method: 'POST', headers: { Authorization: token } });
    // Refresh
    window.location.reload();
  };

  const submit = async () => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`http://localhost:5000/submit/${id}`, { method: 'POST', headers: { Authorization: token, 'Content-Type': 'application/json' }, body: JSON.stringify({ truth }) });
    // Refresh
    window.location.reload();
  };

  const onToken = async (stripeToken) => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`http://localhost:5000/pay/${id}`, { method: 'POST', headers: { Authorization: token, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: stripeToken.id }) });
    // Refresh
    window.location.reload();
  };

  if (!dispute) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={join}>Join</button>
      <h3>Parties:</h3>
      <ul>{dispute.parties.map(p => <li key={p}>{p}</li>)}</ul>
      <h3>Submissions:</h3>
      <ul>{dispute.submissions.map(s => <li key={s.party}>{s.party} - Submitted: {s.truth ? 'Yes' : 'No'}</li>)}</ul>
      <input value={truth} onChange={e => setTruth(e.target.value)} placeholder="Your Truth" />
      <button onClick={submit}>Submit</button>
      <StripeCheckout
        token={onToken}
        stripeKey="your_stripe_publishable_key" // Get from stripe.com
        amount={100}
        currency="USD"
      >
        <button>Pay $1</button>
      </StripeCheckout>
      {dispute.verdict && <p>Verdict: {dispute.verdict}</p>}
    </div>
  );
};

export default Dispute;
