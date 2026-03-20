// src/pages/HomePage.tsx
import { AUTH_TOKEN_KEY } from '@/utils/constants';

const HomePage: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Dashboard: Welcome !</h1>
      <button onClick={() => {
        localStorage.removeItem(AUTH_TOKEN_KEY); 
        window.location.reload();
      }}>
        Logout
      </button>
    </div>
  );
};

export default HomePage;