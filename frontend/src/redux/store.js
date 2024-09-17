import { configureStore } from '@reduxjs/toolkit';
import userInfo from './auth/auth';

const store = configureStore({
  reducer: {
    user: userInfo,
    // dish: dishReducer
  }
});

export default store;
