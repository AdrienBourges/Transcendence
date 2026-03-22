import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // 1. Debug: Confirm the component is actually mounting
    console.log("--- AuthCallbackPage Mounted ---");
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    console.log("Token from URL:", token ? "Found (Hidden for safety)" : "NOT FOUND");

    if (token) {
      // 2. Clear any old data first to avoid conflicts
      localStorage.clear(); 
      
      // 3. Save the new token
      localStorage.setItem('auth_token', token)

      console.log("Token saved to localStorage.");

      // 4. Force a small delay to ensure localStorage is ready, then sync state
      const verifyAndRedirect = async () => {
        try {
          console.log("Triggering checkAuth...");
          await checkAuth(); // Sync Zustand state with the new token
          console.log("CheckAuth successful, navigating to home...");
          navigate('/', { replace: true });
        } catch (error) {
          console.error("CheckAuth failed during callback:", error);
          navigate('/login?error=sync_failed', { replace: true });
        }
      };

      verifyAndRedirect();
    } else {
      console.warn("No token in URL, bouncing back to login.");
      navigate('/login', { replace: true });
    }
  }, [checkAuth, navigate]);

  return (
    <div style={{ backgroundColor: '#000', color: '#00babc', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <h1>SYNCING AUTH...</h1>
    </div>
  );
};

export default AuthCallbackPage;


// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '@/store/useAuthStore';

// /**
//  * AuthCallbackPage Component
//  * Handles the JWT from 42 and synchronizes auth state.
//  */
// const AuthCallbackPage = () => {
//   const navigate = useNavigate();
//   const checkAuth = useAuthStore((state) => state.checkAuth);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get('token');

//     if (token) {
//       // Use 'jwt_token' as the key to match your store/interceptors
//       localStorage.setItem('jwt_token', token);
      
//       checkAuth()
//         .then(() => {
//           navigate('/', { replace: true });
//         })
//         .catch((err) => {
//           console.error("Auth sync failed:", err);
//           navigate('/login', { replace: true });
//         });
//     } else {
//       navigate('/login', { replace: true });
//     }
//   }, [checkAuth, navigate]);

//   return (
//     <div style={containerStyle}>
//       <div style={contentStyle}>
//         {/* Safe loading indicator without external stylesheet dependency */}
//         <div className="simple-loader"></div>
//         <h2 style={titleStyle}>Authenticating with 42...</h2>
//         <p style={textStyle}>Please wait while we sync your profile.</p>
//       </div>
//       <style>{`
//         .simple-loader {
//           margin: 0 auto 20px;
//           width: 40px;
//           height: 40px;
//           border: 3px solid rgba(0, 186, 188, 0.1);
//           border-top: 3px solid #00babc;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//         }
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// const containerStyle: React.CSSProperties = {
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   height: '100vh',
//   backgroundColor: '#000000',
//   color: '#ffffff',
//   fontFamily: 'sans-serif',
// };

// const contentStyle: React.CSSProperties = {
//   textAlign: 'center',
// };

// const titleStyle: React.CSSProperties = {
//   fontSize: '1.5rem',
//   marginBottom: '8px',
// };

// const textStyle: React.CSSProperties = {
//   color: '#888888',
//   fontSize: '0.9rem',
// };

// export default AuthCallbackPage;