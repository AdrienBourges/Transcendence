import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchFullResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token_key');
        const res = await axios.get(`/api/users/search?username=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data);
      } catch (err) {
        console.error("SEARCH_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullResults();
  }, [query]);

  return (
    <div style={styles.container}>
      <div style={styles.scanline}></div>

      <div style={styles.content}>
        <div style={styles.headerSection}>
          <h2 style={styles.title}>
            <span style={styles.accentText}>SEARCH::</span>QUERY_RESULT
          </h2>
          <p style={styles.subtitle}>TARGET_STRING: "{query}"</p>
        </div>

        <div style={styles.resultsWrapper}>
          {loading ? (
            <div style={styles.loader}>
              <div className="pulse" style={styles.pulseAnim}></div>
              <span>[ INITIALIZING_SCAN... ]</span>
            </div>
          ) : results.length > 0 ? (
            <div style={styles.grid}>
              {results.map((user: any) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  style={styles.card}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#A2D2FF';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(162, 210, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(162, 210, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={styles.cardInner}>
                    <div style={styles.avatarPlaceholder}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userInfo}>
                      <div style={styles.username}>{user.username}</div>
                      <div style={styles.status}>ID: {user.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                  <div style={styles.cardAction}>ACCESS_DATA {'>>'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.errorState}>
              <p>[ ! ] NO_MATCHES_FOUND_IN_CENTRAL_DATABASE</p>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/')} style={styles.backButton}>
          <span style={{ marginRight: '8px' }}>{'<<'}</span>
          BACK_TO_CORE_SYSTEM
        </button>
      </div>
    </div>
  );
};

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#050505',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: '"JetBrains Mono", monospace',
    padding: '100px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  scanline: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'rgba(162, 210, 255, 0.03)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  headerSection: {
    marginBottom: '50px',
    borderLeft: '4px solid #A2D2FF',
    paddingLeft: '20px',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
    letterSpacing: '2px',
    fontWeight: 700,
  },
  accentText: {
    color: '#A2D2FF',
    marginRight: '10px',
  },
  subtitle: {
    opacity: 0.5,
    marginTop: '10px',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(162, 210, 255, 0.1)',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '120px',
  },
  cardInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  avatarPlaceholder: {
    width: '45px',
    height: '45px',
    background: 'rgba(162, 210, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#A2D2FF',
    fontSize: '1.2rem',
    border: '1px solid rgba(162, 210, 255, 0.3)',
  },
  username: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#eee',
  },
  status: {
    fontSize: '0.7rem',
    color: '#666',
    marginTop: '4px',
  },
  cardAction: {
    fontSize: '0.7rem',
    marginTop: '20px',
    textAlign: 'right',
    color: '#A2D2FF',
    opacity: 0.7,
  },
  backButton: {
    marginTop: '60px',
    background: 'transparent',
    border: '1px solid rgba(162, 210, 255, 0.4)',
    color: '#A2D2FF',
    padding: '12px 24px',
    fontFamily: '"JetBrains Mono", monospace',
    cursor: 'pointer',
    transition: '0.2s',
    outline: 'none',
  },
  loader: {
    textAlign: 'center',
    padding: '50px',
    color: '#A2D2FF',
    fontSize: '0.9rem',
  },
  errorState: {
    padding: '40px',
    border: '1px dashed #444',
    textAlign: 'center',
    color: '#666',
  }
};

export default SearchPage;
