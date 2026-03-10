import api from './api'
import { RepairRequest } from '../types'

export const getRequests = async (): Promise<RepairRequest[]> => {
  const { data } = await api.get<RepairRequest[]>('/requests/')
  return data
}

export const getRequestById = async (id: number): Promise<RepairRequest> => {
  const { data } = await api.get<RepairRequest>(`/requests/${id}`)
  return data
}

export const createRequest = async (payload: {
  title: string; description?: string; priority: string; equipment_id: number
}): Promise<RepairRequest> => {
  const { data } = await api.post<RepairRequest>('/requests/', payload)
  return data
}

export const updateRequest = async (id: number, payload: Partial<{
  title: string; description: string; priority: string; status: string;
  assigned_to_id: number | null; notes: string
}>): Promise<RepairRequest> => {
  const { data } = await api.patch<RepairRequest>(`/requests/${id}`, payload)
  return data
}

export const deleteRequest = async (id: number): Promise<void> => {
  await api.delete(`/requests/${id}`)
}
