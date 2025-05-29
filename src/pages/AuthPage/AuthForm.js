import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../../api/auth';

export default function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const isRegister = mode === 'register';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = isRegister
        ? await register(email, username, password)
        : await login(email, password);

      const data = response.data;

      if (data.error || !data.token) {
        setError(data.message || 'Ошибка');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);

      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError('Ошибка сети');
    }
  };

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>

        {isRegister && (
          <>
            <label>Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </>
        )}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{isRegister ? 'Зарегистрироваться' : 'Войти'}</button>

        <p className="auth-toggle">
          {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <span onClick={() => setMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </span>
        </p>

        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}
