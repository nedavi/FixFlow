import api from './api'
import { User, Token } from '../types'

export const login = async (username: string, password: string): Promise<Token> => {
  const form = new URLSearchParams({ username, password })
  const { data } = await api.post<Token>('/auth/login', form)
  return data
}

export const register = async (payload: {
  email: string; username: string; password: string; full_name: string
}): Promise<User> => {
  const { data } = await api.post<User>('/auth/register', payload)
  return data
}

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/auth/me')
  return data
}
