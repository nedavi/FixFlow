import api from './api'
import { Equipment } from '../types'

export const getEquipment = async (): Promise<Equipment[]> => {
  const { data } = await api.get<Equipment[]>('/equipment/')
  return data
}

export const getEquipmentById = async (id: number): Promise<Equipment> => {
  const { data } = await api.get<Equipment>(`/equipment/${id}`)
  return data
}

export const createEquipment = async (payload: Partial<Equipment>): Promise<Equipment> => {
  const { data } = await api.post<Equipment>('/equipment/', payload)
  return data
}

export const updateEquipment = async (id: number, payload: Partial<Equipment>): Promise<Equipment> => {
  const { data } = await api.patch<Equipment>(`/equipment/${id}`, payload)
  return data
}

export const deleteEquipment = async (id: number): Promise<void> => {
  await api.delete(`/equipment/${id}`)
}
