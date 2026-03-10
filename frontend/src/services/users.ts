import api from './api'
import { User } from '../types'

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>('/users/')
  return data
}

export const createUser = async (payload: {
  email: string; username: string; password: string; full_name: string; role: string
}): Promise<User> => {
  const { data } = await api.post<User>('/users/', payload)
  return data
}

export const updateUser = async (id: number, payload: Partial<{
  full_name: string; role: string; is_active: boolean
}>): Promise<User> => {
  const { data } = await api.patch<User>(`/users/${id}`, payload)
  return data
}

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`)
}
