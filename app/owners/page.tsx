"use client";

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type Owner = { id: number; name: string };

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    fetch('/api/owners')
      .then(r => r.json())
      .then(setOwners);
  }, []);

  return (
    <div>
      <h2>Owners</h2>
      <ul>
        {owners.map(o => (
          <li key={o.id}>{o.name}</li>
        ))}
      </ul>
    </div>
  );
}
