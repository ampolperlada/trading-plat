// frontend/src/contexts/AuthContext.js - Enhanced Authentication Context
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        user: { ...state.user, balance: action.payload }
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token,
          user: JSON.parse(user)
        }
      });
    }
  }, []);

  // Demo credentials for fallback
  const demoCredentials = {
    email: 'demo@trading.com',
    password: 'demo123'
  };

  const loginWithBackend = async (email, password) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Backend login failed');
    }

    return await response.json();
  };

  const loginWithDemo = async (email, password) => {
    // Check demo credentials
    if (email === demoCredentials.email && password === demoCredentials.password) {
      return {
        token: 'demo-jwt-token-' + Date.now(),
        user: {
          id: 1,
          email: 'demo@trading.com',
          name: 'Demo User',
          balance: 10000,
          accountType: 'demo'
        }
      };
    } else {
      throw new Error('Invalid demo credentials');
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      let data;
      
      // Try backend first, fallback to demo
      try {
        console.log('🔄 Attempting backend login...');
        data = await loginWithBackend(email, password);
        console.log('✅ Backend login successful');
      } catch (backendError) {
        console.log('⚠️ Backend unavailable, trying demo login...');
        data = await loginWithDemo(email, password);
        console.log('✅ Demo login successful');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data
      });

      toast.success(`Welcome ${data.user.name}!`);
      router.push('/trading');
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      toast.error(error.message);
    }
  };

  const registerWithBackend = async (userData) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Backend registration failed');
    }

    return await response.json();
  };

  const registerWithDemo = async (userData) => {
    // Create demo account
    return {
      token: 'demo-jwt-token-' + Date.now(),
      user: {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        balance: 10000,
        accountType: 'demo'
      }
    };
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      let data;
      
      // Try backend first, fallback to demo
      try {
        console.log('🔄 Attempting backend registration...');
        data = await registerWithBackend(userData);
        console.log('✅ Backend registration successful');
      } catch (backendError) {
        console.log('⚠️ Backend unavailable, creating demo account...');
        data = await registerWithDemo(userData);
        console.log('✅ Demo account created');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data
      });

      toast.success('Account created successfully!');
      router.push('/trading');
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      toast.error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    router.push('/');
    toast.success('Logged out successfully');
  };

  const updateBalance = (newBalance) => {
    dispatch({ type: 'UPDATE_BALANCE', payload: newBalance });
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      user.balance = newBalance;
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};