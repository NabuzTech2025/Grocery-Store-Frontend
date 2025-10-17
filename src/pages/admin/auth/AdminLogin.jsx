import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAuth } from "../../../api/auth";
import { useAuth } from '../../../auth/AuthProvider'; 


const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
    setLoading(true);
    setError('');
  
    try {
      const data = await loginAuth(email, password);
      const token = data.data?.access_token;
      const role = data.data?.role_id;
  
      if (token) {
        await login({ token, role }); // Store token in context or localStorage
  
        // Fetch user profile from /user/me using fetch
        const meRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!meRes.ok) throw new Error('Failed to fetch user profile');
        const userProfile = await meRes.json();
        console.log('User Profile:', userProfile.store_id);
        localStorage.setItem('store_id', userProfile.store_id);

        navigate('/admin/home');
      } else {
        setError('Invalid login credentials');
      }
    } catch (err) {
      setError('Incorrect email or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <div data-pc-preset="preset-1" data-pc-sidebar-theme="light" data-pc-sidebar-caption="true" data-pc-direction="ltr" data-pc-theme="light">
     {loading && (
        <div className="loader-bg">
          <div className="loader-track">
            <div className="loader-fill"></div>
          </div>
        </div>
      )}
      <div className="auth-main v1">
        <div className="auth-wrapper">
          <div className="auth-form">
            <div className="card my-5">
              <div className="card-body">
                <div className="text-center">
                  <img
                    src="/assets/images/authentication/img-auth-login.png"
                    alt="Login"
                    className="img-fluid mb-3"
                  />
                  <h4 className="f-w-500 mb-1">Admin Login</h4>
                  <p className="mb-3">
                    {' '}
                    <a href="#" className="link-primary ms-1"></a>
                  </p>
                </div>
                <div className="mb-3">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control mb-2" placeholder="Email" />
                </div>
                <div className="mb-3">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control mb-2" placeholder="Password" />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="d-flex mt-1 justify-content-between align-items-center">
                  <div className="form-check">
                    <label className="form-check-label text-muted" htmlFor="remember"></label>
                  </div>
                  <a href="#"><h6 className="f-w-400 mb-0"></h6></a>
                </div>
                <div className="d-grid mt-4">
                <button className="btn btn-primary w-100" onClick={handleLogin} disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
                </div>
                <div className="saprator my-3">
                  <span></span>
                </div>
                <div className="text-center"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
