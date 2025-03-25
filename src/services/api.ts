import type { Plastic, Model, Printer } from '@/types';

const API_URL = 'http://localhost:3000';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
};

export const printersApi = {
  getAll: async (): Promise<Printer[]> => {
    try {
      const response = await fetch(`${API_URL}/printers`);
      return handleResponse(response);
    } catch (error) {
      console.error('Ошибка при получении принтеров:', error);
      return [];
    }
  },
  
  getById: async (id: number): Promise<Printer | null> => {
    try {
      const response = await fetch(`${API_URL}/printers/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Ошибка при получении принтера с ID ${id}:`, error);
      return null;
    }
  },
  
  create: async (printer: Omit<Printer, 'id'>): Promise<Printer> => {
    const response = await fetch(`${API_URL}/printers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(printer)
    });
    return handleResponse(response);
  },
  
  update: async (id: number, printer: Partial<Printer>): Promise<Printer> => {
    const response = await fetch(`${API_URL}/printers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(printer)
    });
    return handleResponse(response);
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/printers/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

export const plasticsApi = {
  getAll: async (): Promise<Plastic[]> => {
    try {
      const response = await fetch(`${API_URL}/plastics`);
      return handleResponse(response);
    } catch (error) {
      console.error('Ошибка при получении пластиков:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Plastic | null> => {
    try {
      const response = await fetch(`${API_URL}/plastics/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Ошибка при получении пластика с ID ${id}:`, error);
      return null;
    }
  },
  
  create: async (plastic: Omit<Plastic, 'id'>): Promise<Plastic> => {
    const response = await fetch(`${API_URL}/plastics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plastic)
    });
    return handleResponse(response);
  },
  
  update: async (id: number, plastic: Partial<Plastic>): Promise<Plastic> => {
    const response = await fetch(`${API_URL}/plastics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plastic)
    });
    return handleResponse(response);
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/plastics/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

export const modelsApi = {
  getAll: async (): Promise<Model[]> => {
    try {
      const response = await fetch(`${API_URL}/models`);
      return handleResponse(response);
    } catch (error) {
      console.error('Ошибка при получении моделей:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Model | null> => {
    try {
      const response = await fetch(`${API_URL}/models/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Ошибка при получении модели с ID ${id}:`, error);
      return null;
    }
  },
  
  create: async (model: Omit<Model, 'id'>): Promise<Model> => {
    const response = await fetch(`${API_URL}/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model)
    });
    return handleResponse(response);
  },
  
  update: async (id: number, model: Partial<Model>): Promise<Model> => {
    const response = await fetch(`${API_URL}/models/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model)
    });
    return handleResponse(response);
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/models/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};