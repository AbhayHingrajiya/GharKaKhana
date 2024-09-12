import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  email: '',
  isLogedin: false,
  userType: ''
};

const userInfo = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.isLogedin = !!action.payload.name;
      state.userType = action.payload.userType;
    },
    logout(state) {
      state.name = '';
      state.email = '';
      state.isLogedin = false;
      state.userType = '';
    }
  }
});

export const { setUser, logout } = userInfo.actions;
export default userInfo.reducer;
