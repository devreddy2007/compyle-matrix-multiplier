import React from 'react';
import { LoginForm } from '../components/LoginForm';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};
