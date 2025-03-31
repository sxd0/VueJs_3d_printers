import { printersApi, plasticsApi, modelsApi } from './api';
import type { Printer, Plastic, Model, PrinterError } from '@/types';
import { PrinterStatus, PrinterErrorType, ModelStatus } from '@/types';

export class PrinterService {
  // Метод для установки пластика в принтер
  static async installPlastic(printerId: number, plasticId: number): Promise<boolean> {
    try {
      const printer = await printersApi.getById(printerId);
      const plastic = await plasticsApi.getById(plasticId);
      
      if (!printer || !plastic) return false;
      
      // Нельзя установить пластик если принтер занят печатью
      if (printer.status === PrinterStatus.PRINTING) return false;
      
      // Если пластик уже установлен в другом принтере, нельзя его использовать
      if (plastic.isInstalled && plastic.printerId !== printerId) return false;
      
      // Обновляем данные принтера
      await printersApi.update(printerId, { 
        plasticId: plasticId,
        status: PrinterStatus.IDLE 
      });
      
      // Обновляем данные пластика
      await plasticsApi.update(plasticId, { 
        isInstalled: true,
        printerId: printerId 
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при установке пластика:', error);
      return false;
    }
  }
  
  // Метод для удаления пластика из принтера
  static async removePlastic(printerId: number): Promise<boolean> {
    try {
      const printer = await printersApi.getById(printerId);
      
      if (!printer || !printer.plasticId) return false;
      
      // Нельзя удалить пластик если принтер печатает
      if (printer.status === PrinterStatus.PRINTING) return false;
      
      const plasticId = printer.plasticId;
      
      // Обновляем данные принтера
      await printersApi.update(printerId, { 
        plasticId: undefined,
        status: PrinterStatus.IDLE 
      });
      
      // Обновляем данные пластика
      await plasticsApi.update(plasticId, { 
        isInstalled: false,
        printerId: undefined 
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении пластика:', error);
      return false;
    }
  }
  
  // Метод для добавления модели в очередь печати
  static async addModelToPrinter(printerId: number, modelId: number): Promise<boolean> {
    try {
      const printer = await printersApi.getById(printerId);
      const model = await modelsApi.getById(modelId);
      
      if (!printer || !model) return false;
      
      // Проверяем, установлен ли пластик
      if (!printer.plasticId) return false;
      
      const plastic = await plasticsApi.getById(printer.plasticId);
      if (!plastic) return false;
      
      // Проверяем, хватит ли пластика для печати
      if (plastic.length < model.perimeterLength) return false;
      
      // Обновляем данные модели
      await modelsApi.update(modelId, {
        status: ModelStatus.PRINTING,
        printerId: printerId
      });
      
      // Если принтер не занят, запускаем печать
      if (printer.status !== PrinterStatus.PRINTING) {
        await printersApi.update(printerId, {
          currentModelId: modelId,
          status: PrinterStatus.PRINTING,
          printingProgress: 0
        });
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при добавлении модели в очередь:', error);
      return false;
    }
  }
  
  // Метод для генерации случайной ошибки при печати
  static generateRandomError(modelId: number): PrinterError | null {
    // 10% шанс возникновения ошибки
    if (Math.random() > 0.1) return null;
    
    // Генерация случайного типа ошибки
    const errorTypes = Object.values(PrinterErrorType);
    const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    return {
      type: randomType,
      message: `Возникла ошибка: ${randomType}`,
      modelId: modelId
    };
  }
}