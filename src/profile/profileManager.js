// Profile management — localStorage backed
// Each profile: { id, name, pin, createdAt }
// Active profile stored separately

const PROFILES_KEY = 'boardgame-profiles';
const ACTIVE_KEY = 'boardgame-active-profile';

function getAllProfiles() {
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAllProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getProfiles() {
  return getAllProfiles().map(({ id, name, createdAt }) => ({ id, name, createdAt }));
}

export function createProfile(name, pin) {
  const profiles = getAllProfiles();
  const id = `profile_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const profile = { id, name: name.trim(), pin, createdAt: Date.now() };
  profiles.push(profile);
  saveAllProfiles(profiles);
  return { id, name: profile.name, createdAt: profile.createdAt };
}

export function verifyPin(profileId, pin) {
  const profiles = getAllProfiles();
  const profile = profiles.find(p => p.id === profileId);
  return profile && profile.pin === pin;
}

export function deleteProfile(profileId, pin) {
  const profiles = getAllProfiles();
  const profile = profiles.find(p => p.id === profileId);
  if (!profile || profile.pin !== pin) return false;
  saveAllProfiles(profiles.filter(p => p.id !== profileId));
  // Also clean up progress data
  localStorage.removeItem(`chess-progress-${profileId}`);
  if (getActiveProfileId() === profileId) {
    clearActiveProfile();
  }
  return true;
}

export function setActiveProfile(profileId) {
  localStorage.setItem(ACTIVE_KEY, profileId);
}

export function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_KEY);
}

export function getActiveProfile() {
  const id = getActiveProfileId();
  if (!id) return null;
  const profiles = getAllProfiles();
  const p = profiles.find(pr => pr.id === id);
  return p ? { id: p.id, name: p.name, createdAt: p.createdAt } : null;
}

export function clearActiveProfile() {
  localStorage.removeItem(ACTIVE_KEY);
}
