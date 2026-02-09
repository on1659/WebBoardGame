import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { createUser, loginUserByName, checkNameExists } from './api';
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
  const [step, setStep] = useState('choose'); // choose | login-name | login-pin | signup-name | signup-pin
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [recentNames, setRecentNames] = useState([]);

  useEffect(() => {
    setRecentNames(getRecentNames());
  }, []);

  const handleLogin = async (pinOverride) => {
    const p = pinOverride || pin;
    if (p.length !== 4) { setError('숫자 4개를 눌러줘! 🔢'); return; }
    try {
      const user = await loginUserByName(name.trim(), p);
      saveRecentName(name.trim());
      login(user, { name: name.trim(), pin: p });
    } catch (e) {
      setError('이름이나 암호가 틀렸어요 😢');
      setPin('');
    }
  };

  const handleCreate = async (pinOverride) => {
    const p = pinOverride || pin;
    if (p.length !== 4) { setError('숫자 4개를 눌러줘! 🔢'); return; }
    try {
      const user = await createUser(name.trim(), p);
      saveRecentName(name.trim());
      login(user, { name: name.trim(), pin: p });
    } catch (e) {
      setError(e.message);
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
          <button key={n} className={styles.numBtn} disabled={pin.length >= 4} onClick={() => {
            const newPin = pin + n;
            setPin(newPin);
            setError('');
            if (newPin.length === 4) {
              setTimeout(() => onComplete(newPin), 200);
            }
          }}>{n}</button>
        ))}
        <button className={styles.numBtn} onClick={() => { setPin(''); setError(''); }}>🗑️</button>
        <button className={styles.numBtn} disabled={pin.length >= 4} onClick={() => {
          const newPin = pin + '0';
          setPin(newPin);
          setError('');
          if (newPin.length === 4) {
            setTimeout(() => onComplete(newPin), 200);
          }
        }}>0</button>
        <button className={`${styles.numBtn} ${styles.confirmBtn}`} disabled={pin.length !== 4} onClick={() => onComplete(pin)}>✅</button>
      </div>
    </div>
  );

  // Step 1: Choose login or signup
  if (step === 'choose') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🎮 반가워요!</h1>
        <p className={styles.subtitle}>어떻게 할까요?</p>
        <div className={styles.choiceButtons}>
          <button className={styles.choiceBtn} style={{ '--btn-color': '#a8d5ba' }} onClick={() => { setStep('login-name'); setName(''); setPin(''); setError(''); }}>
            <span className={styles.choiceEmoji}>👋</span>
            <span className={styles.choiceText}>다시 왔어요!</span>
            <span className={styles.choiceDesc}>전에 만든 이름으로 들어가기</span>
          </button>
          <button className={styles.choiceBtn} style={{ '--btn-color': '#f8bbd9' }} onClick={() => { setStep('signup-name'); setName(''); setPin(''); setError(''); }}>
            <span className={styles.choiceEmoji}>🌟</span>
            <span className={styles.choiceText}>처음이에요!</span>
            <span className={styles.choiceDesc}>새 이름 만들기</span>
          </button>
        </div>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            ◀ 돌아가기
          </button>
        )}
      </div>
    );
  }

  // Login - Step 2a: Enter name
  if (step === 'login-name') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>👋 다시 왔구나!</h1>
        <p className={styles.subtitle}>이름이 뭐였지?</p>
        <div className={styles.nameSection}>
          <input
            className={styles.nameInput}
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="이름을 써줘"
            maxLength={10}
            autoFocus
          />
          {recentNames.length > 0 && (
            <div className={styles.recentSection}>
              <p className={styles.recentLabel}>최근에 왔던 친구</p>
              <div className={styles.recentList}>
                {recentNames.map(n => (
                  <button key={n} className={styles.recentItem} onClick={() => setName(n)}>
                    😊 {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <button
          className={styles.nextBtn}
          disabled={!name.trim()}
          onClick={() => { if (name.trim()) { setStep('login-pin'); setPin(''); setError(''); } }}
        >
          다음 ➡️
        </button>
        <button className={styles.backBtn} onClick={() => setStep('choose')}>
          ◀ 뒤로
        </button>
      </div>
    );
  }

  // Login - Step 2b: Enter pin
  if (step === 'login-pin') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🔑 비밀 숫자!</h1>
        <p className={styles.subtitle}><strong>{name}</strong>의 비밀 숫자를 눌러줘</p>
        {numPad(handleLogin)}
        <button className={styles.backBtn} onClick={() => { setStep('login-name'); setPin(''); setError(''); }}>
          ◀ 뒤로
        </button>
      </div>
    );
  }

  // Signup - Step 2a: Enter name
  if (step === 'signup-name') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🌟 환영해요!</h1>
        <p className={styles.subtitle}>어떤 이름으로 할까?</p>
        <div className={styles.nameSection}>
          <input
            className={styles.nameInput}
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="멋진 이름을 써줘"
            maxLength={10}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <button
          className={styles.nextBtn}
          disabled={!name.trim()}
          onClick={async () => {
            if (!name.trim()) return;
            try {
              const exists = await checkNameExists(name.trim());
              if (exists) {
                setError('이미 있는 이름이야! 다른 이름을 써줘 😊');
              } else {
                setStep('signup-pin'); setPin(''); setError('');
              }
            } catch {
              setStep('signup-pin'); setPin(''); setError('');
            }
          }}
        >
          다음 ➡️
        </button>
        <button className={styles.backBtn} onClick={() => setStep('choose')}>
          ◀ 뒤로
        </button>
      </div>
    );
  }

  // Signup - Step 2b: Create pin
  if (step === 'signup-pin') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🤫 비밀 숫자 만들기!</h1>
        <p className={styles.subtitle}><strong>{name}</strong>만 아는 숫자 4개를 정해줘</p>
        {numPad(handleCreate)}
        <button className={styles.backBtn} onClick={() => { setStep('signup-name'); setPin(''); setError(''); }}>
          ◀ 뒤로
        </button>
      </div>
    );
  }

  return null;
}
