import { useState, useCallback } from 'react';
import { getProfiles, createProfile, verifyPin, setActiveProfile, deleteProfile } from './profileManager';
import styles from './ProfileSelect.module.css';

const ANIMAL_EMOJIS = ['🐶', '🐱', '🐰', '🐻', '🦊', '🐸', '🐵', '🐧', '🦁', '🐯', '🐮', '🐷'];

function getEmoji(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return ANIMAL_EMOJIS[Math.abs(hash) % ANIMAL_EMOJIS.length];
}

export default function ProfileSelect({ onProfileSelected }) {
  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'pin'
  const [profiles, setProfiles] = useState(() => getProfiles());
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const refreshProfiles = useCallback(() => setProfiles(getProfiles()), []);

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) { setError('이름을 입력해줘! 😊'); return; }
    if (trimmed.length > 8) { setError('이름은 8글자까지야!'); return; }
    if (!/^\d{4}$/.test(pin)) { setError('비밀번호는 숫자 4자리로 해줘! 🔢'); return; }

    const profile = createProfile(trimmed, pin);
    setActiveProfile(profile.id);
    onProfileSelected(profile);
  }, [name, pin, onProfileSelected]);

  const handlePinSubmit = useCallback(() => {
    if (!selectedProfile) return;
    if (verifyPin(selectedProfile.id, pin)) {
      setActiveProfile(selectedProfile.id);
      onProfileSelected(selectedProfile);
    } else {
      setError('비밀번호가 틀렸어! 다시 해봐 🔑');
      setPin('');
    }
  }, [selectedProfile, pin, onProfileSelected]);

  const handleDelete = useCallback(() => {
    if (!selectedProfile) return;
    if (deleteProfile(selectedProfile.id, pin)) {
      refreshProfiles();
      setMode('list');
      setSelectedProfile(null);
      setPin('');
      setError('');
    } else {
      setError('비밀번호가 틀렸어!');
    }
  }, [selectedProfile, pin, refreshProfiles]);

  // PIN entry screen
  if (mode === 'pin' && selectedProfile) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🔑 비밀번호</h1>
        <div className={styles.profileBig}>
          <span className={styles.bigEmoji}>{getEmoji(selectedProfile.name)}</span>
          <span className={styles.bigName}>{selectedProfile.name}</span>
        </div>
        <p className={styles.subtitle}>비밀번호 4자리를 입력해줘!</p>

        <div className={styles.pinDots}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`${styles.dot} ${pin.length > i ? styles.dotFilled : ''}`} />
          ))}
        </div>

        <div className={styles.numpad}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className={styles.numKey} onClick={() => pin.length < 4 && setPin(p => p + n)}>
              {n}
            </button>
          ))}
          <button className={styles.numKey} onClick={() => { setMode('list'); setPin(''); setError(''); }}>
            ⬅️
          </button>
          <button className={styles.numKey} onClick={() => pin.length < 4 && setPin(p => p + '0')}>
            0
          </button>
          <button className={styles.numKey} onClick={() => setPin(p => p.slice(0, -1))}>
            ⌫
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.confirmButton}
          onClick={handlePinSubmit}
          disabled={pin.length !== 4}
        >
          ✅ 확인
        </button>

        <button className={styles.deleteButton} onClick={handleDelete}>
          🗑️ 프로필 삭제
        </button>
      </div>
    );
  }

  // Create screen
  if (mode === 'create') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>✨ 새 프로필 만들기</h1>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>이름이 뭐야? 😄</label>
          <input
            className={styles.textInput}
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="이름을 써줘"
            maxLength={8}
            autoFocus
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>비밀번호 숫자 4개를 정해줘! 🔢</label>
          <div className={styles.pinDots}>
            {[0,1,2,3].map(i => (
              <div key={i} className={`${styles.dot} ${pin.length > i ? styles.dotFilled : ''}`} />
            ))}
          </div>
          <div className={styles.numpad}>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} className={styles.numKey} onClick={() => pin.length < 4 && setPin(p => p + n)}>
                {n}
              </button>
            ))}
            <div />
            <button className={styles.numKey} onClick={() => pin.length < 4 && setPin(p => p + '0')}>
              0
            </button>
            <button className={styles.numKey} onClick={() => setPin(p => p.slice(0, -1))}>
              ⌫
            </button>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actionButtons}>
          <button className={styles.confirmButton} onClick={handleCreate}>
            🎉 만들기!
          </button>
          <button className={styles.backButton} onClick={() => { setMode('list'); setName(''); setPin(''); setError(''); }}>
            ⬅️ 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Profile list
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎲 보드게임 세상 🎲</h1>
      <p className={styles.subtitle}>누가 놀러 왔어? 😊</p>

      <div className={styles.profileList}>
        {profiles.map((profile, index) => (
          <button
            key={profile.id}
            className={styles.profileCard}
            onClick={() => { setSelectedProfile(profile); setMode('pin'); setPin(''); setError(''); }}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <span className={styles.profileEmoji}>{getEmoji(profile.name)}</span>
            <span className={styles.profileName}>{profile.name}</span>
          </button>
        ))}

        <button
          className={styles.addCard}
          onClick={() => { setMode('create'); setName(''); setPin(''); setError(''); }}
          style={{ animationDelay: `${profiles.length * 0.08}s` }}
        >
          <span className={styles.addIcon}>➕</span>
          <span className={styles.addText}>새 친구</span>
        </button>
      </div>
    </div>
  );
}
