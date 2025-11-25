// src/store/quoteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// async thunk to fetch a quote from Quotable
export const fetchSavingsQuote = createAsyncThunk(
  'quote/fetchSavingsQuote',
  async () => {
    const res = await fetch(
      'https://api.quotable.io/random?tags=wisdom|business|success'
    )

    if (!res.ok) {
      throw new Error('failed to fetch quote')
    }

    const data = await res.json()
    return {
      text: data.content,
      author: data.author,
    }
  }
)

const quoteSlice = createSlice({
  name: 'quote',
  initialState: {
    text: '',
    author: '',
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavingsQuote.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSavingsQuote.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.text = action.payload.text
        state.author = action.payload.author
      })
      .addCase(fetchSavingsQuote.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'unable to load quote'
      })
  },
})

export default quoteSlice.reducer
