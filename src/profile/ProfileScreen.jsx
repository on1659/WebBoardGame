import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { fetchUsers, createUser, loginUser } from './api';
import styles from './ProfileScreen.module.css';

export default function ProfileScreen() {
  const { login } = useUser();
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState('select'); // select | create | pin
  const [selectedUser, setSelectedUser] = useState(null);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(u => { setUsers(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) { setError('이름을 써줘! 😊'); return; }
    if (pin.length !== 4) { setError('숫자 4개를 눌러줘! 🔢'); return; }
    try {
      const user = await createUser(name.trim(), pin);
      login(user);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogin = async () => {
    if (pin.length !== 4) { setError('숫자 4개를 눌러줘! 🔢'); return; }
    try {
      const user = await loginUser(selectedUser.id, pin);
      login(user);
    } catch (e) {
      setError('암호가 틀렸어요 😢');
      setPin('');
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

  if (loading) {
    return <div className={styles.container}><p className={styles.loadingText}>로딩 중... ⏳</p></div>;
  }

  // PIN entry for existing user
  if (mode === 'pin' && selectedUser) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🔒 암호를 눌러줘!</h1>
        <p className={styles.subtitle}>{selectedUser.name}의 비밀번호</p>
        {numPad(handleLogin)}
        <button className={styles.backBtn} onClick={() => { setMode('select'); setPin(''); setError(''); }}>
          ◀ 뒤로
        </button>
      </div>
    );
  }

  // Create new profile
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
        <button className={styles.backBtn} onClick={() => { setMode('select'); setPin(''); setName(''); setError(''); }}>
          ◀ 뒤로
        </button>
      </div>
    );
  }

  // Profile select
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎮 누가 놀러 왔나요?</h1>
      <div className={styles.profileGrid}>
        {users.map(u => (
          <button key={u.id} className={styles.profileCard} onClick={() => {
            setSelectedUser(u);
            setMode('pin');
            setPin('');
            setError('');
          }}>
            <span className={styles.avatar}>😊</span>
            <span className={styles.profileName}>{u.name}</span>
          </button>
        ))}
        <button className={`${styles.profileCard} ${styles.newProfile}`} onClick={() => {
          setMode('create');
          setPin('');
          setName('');
          setError('');
        }}>
          <span className={styles.avatar}>➕</span>
          <span className={styles.profileName}>새 친구!</span>
        </button>
      </div>
    </div>
  );
}
