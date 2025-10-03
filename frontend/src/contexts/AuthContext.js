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
    case 'DEPOSIT':
      return {
        ...state,
        user: {
          ...state.user,
          balance: state.user.balance + action.payload.amount,
          deposits: [...(state.user.deposits || []), action.payload]
        }
      };
    case 'WITHDRAW':
      return {
        ...state,
        user: {
          ...state.user,
          balance: state.user.balance - action.payload.amount,
          withdrawals: [...(state.user.withdrawals || []), action.payload]
        }
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
    } else {
      toast.info('This is a demo trading platform for educational purposes only. No real money is involved.');
    }
  }, []);

  // Demo credentials for fallback
  const demoCredentials = {
    email: 'demo@trading.com',
    password: 'demo123'
  };

  const loginWithDemo = async (email, password) => {
    const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
    const user = users[email];

    if (user && user.password === password) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      return {
        token: `demo-jwt-token-${Date.now()}`,
        user: userWithoutPassword
      };
    }
    throw new Error('Invalid demo credentials');
  };

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      let data;
      if (email === demoCredentials.email && password === demoCredentials.password) {
        data = {
          token: `demo-jwt-token-${Date.now()}`,
          user: {
            id: '1',
            email: demoCredentials.email,
            name: 'Demo User',
            balance: 10000,
            deposits: [],
            withdrawals: [],
            trades: [],
            accountType: 'demo'
          }
        };
      } else {
        data = await loginWithDemo(email, password);
      }
      console.log('✅ Demo login successful');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data
      });

      toast.success(`Welcome ${data.user.name}! This is a simulated trading environment for learning purposes only.`);
      router.push('/trading');
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      toast.error(error.message);
    }
  };

  const registerWithDemo = async (userData) => {
    const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
    if (users[userData.email]) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      password: userData.password,
      name: userData.name,
      balance: 10000,
      deposits: [],
      withdrawals: [],
      trades: [],
      accountType: 'demo',
      createdAt: new Date().toISOString()
    };

    users[userData.email] = newUser;
    localStorage.setItem('demoUsers', JSON.stringify(users));

    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    return {
      token: `demo-jwt-token-${Date.now()}`,
      user: userWithoutPassword
    };
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const data = await registerWithDemo(userData);
      console.log('✅ Demo account created');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data
      });

      toast.success('Demo account created successfully! This is a simulated trading environment for educational purposes only.');
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

  const deposit = (amount) => {
    if (!state.user) {
      toast.error('Please log in to deposit funds');
      return;
    }
    if (amount <= 0) {
      toast.error('Invalid deposit amount');
      return;
    }

    dispatch({
      type: 'DEPOSIT',
      payload: {
        amount,
        date: new Date().toISOString(),
        method: 'simulated' // Added for tracking
      }
    });

    const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
    const currentUser = users[state.user.email];
    currentUser.balance += amount;
    currentUser.deposits = [...(currentUser.deposits || []), {
      amount,
      date: new Date().toISOString(),
      method: 'simulated'
    }];
    users[state.user.email] = currentUser;
    localStorage.setItem('demoUsers', JSON.stringify(users));

    const updatedUser = { ...currentUser };
    delete updatedUser.password;
    localStorage.setItem('user', JSON.stringify(updatedUser));

    toast.success(`Successfully deposited ${amount} in demo funds. This is a simulation for learning purposes only.`);
  };

  const withdraw = (amount) => {
    if (!state.user) {
      toast.error('Please log in to withdraw funds');
      return;
    }
    if (amount <= 0 || state.user.balance < amount) {
      toast.error('Invalid or insufficient funds for withdrawal');
      return;
    }

    dispatch({
      type: 'WITHDRAW',
      payload: {
        amount,
        date: new Date().toISOString(),
        method: 'simulated' // Added for tracking
      }
    });

    const users = JSON.parse(localStorage.getItem('demoUsers') || '{}');
    const currentUser = users[state.user.email];
    currentUser.balance -= amount;
    currentUser.withdrawals = [...(currentUser.withdrawals || []), {
      amount,
      date: new Date().toISOString(),
      method: 'simulated'
    }];
    users[state.user.email] = currentUser;
    localStorage.setItem('demoUsers', JSON.stringify(users));

    const updatedUser = { ...currentUser };
    delete updatedUser.password;
    localStorage.setItem('user', JSON.stringify(updatedUser));

    toast.success(`Successfully withdrew ${amount} in demo funds. This is a simulation for learning purposes only.`);
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      deposit,
      withdraw,
      updateBalance: (newBalance) => dispatch({ type: 'UPDATE_BALANCE', payload: newBalance })
    }}>
      {children}
      <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded-lg shadow-lg text-black text-sm font-semibold">
        <p>Disclaimer: This is a demo trading platform for educational purposes only. No real money is involved, and all transactions are simulated. Trading involves significant risk and may not be suitable for everyone.</p>
      </div>
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