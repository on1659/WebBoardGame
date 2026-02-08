import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { createUser, loginUserByName } from './api';
import styles from './ProfileScreen.module.css';

const RECENT_NAMES_KEY = 'webboardgame_recent_names';

function getRecentNames() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_NAMES_KEY) || '[]');
  } catch { return []; }
}

function saveRecentName(name) {
  const names = getRecentNames().filter(n => n !== name);
  names.unshift(name);
  localStorage.setItem(RECENT_NAMES_KEY, JSON.stringify(names.slice(0, 5)));
}

export default function ProfileScreen({ onBack }) {
  const { login } = useUser();
  const [mode, setMode] = useState('login'); // login | create
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [recentNames, setRecentNames] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    setRecentNames(getRecentNames());
  }, []);

  const handleLogin = async () => {
    if (!name.trim()) { setError('이름을 써줘! 😊'); return; }
    if (pin.length !== 4) { setError('숫자 4개를 눌러줘! 🔢'); return; }
    try {
      const user = await loginUserByName(name.trim(), pin);
      saveRecentName(name.trim());
      login(user);
    } catch (e) {
      setError('이름이나 암호가 틀렸어요 😢');
      setPin('');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) { setError('이름을 써줘! 😊'); return; }
    if (pin.length !== 4) { setError('숫자 4개를 눌러줘! 🔢'); return; }
    try {
      const user = await createUser(name.trim(), pin);
      saveRecentName(name.trim());
      login(user);
    } catch (e) {
      setError(e.message);
    }
  };

  const numPad = (onComplete) => (
    <div className={styles.pinSection}>
      <div className={styles.pinDisplay}>
        {[0,1,2,3].map(i => (
          <span key={i} className={`${styles.pinDot} ${pin[i] ? styles.filled : ''}`}>
            {pin[i] ? '⭐' : '○'}
          </span>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.numGrid}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} className={styles.numBtn} onClick={() => {
            if (pin.length < 4) { setPin(p => p + n); setError(''); }
          }}>{n}</button>
        ))}
        <button className={styles.numBtn} onClick={() => { setPin(''); setError(''); }}>🗑️</button>
        <button className={styles.numBtn} onClick={() => {
          if (pin.length < 4) { setPin(p => p + '0'); setError(''); }
        }}>0</button>
        <button className={`${styles.numBtn} ${styles.confirmBtn}`} onClick={onComplete}>✅</button>
      </div>
    </div>
  );

  if (mode === 'create') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🌟 새 친구 만들기!</h1>
        <div className={styles.nameSection}>
          <label className={styles.label}>이름이 뭐야? 😄</label>
          <input
            className={styles.nameInput}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="이름을 써줘"
            maxLength={10}
            autoFocus
          />
        </div>
        <label className={styles.label}>비밀 숫자 4개를 정해줘! 🤫</label>
        {numPad(handleCreate)}
        <button className={styles.backBtn} onClick={() => { setMode('login'); setPin(''); setName(''); setError(''); }}>
          ◀ 뒤로
        </button>
      </div>
    );
  }

  // Login mode
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎮 안녕! 이름이 뭐야?</h1>
      <div className={styles.nameSection}>
        <div className={styles.nameInputWrapper}>
          <input
            className={styles.nameInput}
            value={name}
            onChange={e => { setName(e.target.value); setShowRecent(false); setError(''); }}
            onFocus={() => recentNames.length > 0 && setShowRecent(true)}
            placeholder="이름을 써줘"
            maxLength={10}
            autoFocus
          />
          {showRecent && recentNames.length > 0 && (
            <div className={styles.recentList}>
              {recentNames.map(n => (
                <button key={n} className={styles.recentItem} onClick={() => {
                  setName(n);
                  setShowRecent(false);
                }}>
                  😊 {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <label className={styles.label}>비밀 숫자를 눌러줘! 🔑</label>
      {numPad(handleLogin)}
      <button className={styles.createBtn} onClick={() => { setMode('create'); setPin(''); setName(''); setError(''); }}>
        ✨ 처음이야? 새로 만들기!
      </button>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          ◀ 돌아가기
        </button>
      )}
    </div>
  );
}
