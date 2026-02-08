const API = '/api';

export async function fetchUsers() {
  const res = await fetch(`${API}/users`);
  return res.json();
}

export async function createUser(name, pin) {
  const res = await fetch(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, pin }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function loginUser(id, pin) {
  const res = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, pin }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function fetchProgress(userId) {
  const res = await fetch(`${API}/progress/${userId}`);
  return res.json();
}

export async function saveProgress(userId, stageType, stageId, stars = 1) {
  const res = await fetch(`${API}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, stage_type: stageType, stage_id: stageId, stars }),
  });
  return res.json();
}
