const API = '/api';

export async function createUser(name, pin) {
  const res = await fetch(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, pin }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function loginUserByName(name, pin) {
  const res = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, pin }),
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

export async function saveGame(userId, gameType, gameState) {
  const res = await fetch(`${API}/game-save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, game_type: gameType, game_state: gameState }),
  });
  return res.json();
}

export async function loadGame(userId, gameType) {
  const res = await fetch(`${API}/game-save/${userId}/${gameType}`);
  return res.json();
}

export async function deleteGame(userId, gameType) {
  await fetch(`${API}/game-save/${userId}/${gameType}`, { method: 'DELETE' });
}
