import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { VaultReminder } from "@/types/reminders";

const remindersSlice = createSlice({
  name: "reminders",
  initialState: [] as VaultReminder[],
  reducers: {
    setReminders(_state, action: PayloadAction<VaultReminder[]>) {
      return action.payload;
    },
    addReminder(state, action: PayloadAction<VaultReminder>) {
      state.push(action.payload);
      state.sort(
        (a, b) =>
          new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime(),
      );
    },
    replaceReminder(state, action: PayloadAction<VaultReminder>) {
      const index = state.findIndex((item) => item.id === action.payload.id);
      if (index === -1) {
        state.push(action.payload);
      } else {
        state[index] = action.payload;
      }
      state.sort(
        (a, b) =>
          new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime(),
      );
    },
    removeReminder(state, action: PayloadAction<string>) {
      return state.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setReminders, addReminder, replaceReminder, removeReminder } =
  remindersSlice.actions;
export const remindersReducer = remindersSlice.reducer;
