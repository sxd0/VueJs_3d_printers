import { printersApi, plasticsApi, modelsApi } from './api';
import type { Printer, Plastic, Model, PrinterError } from '@/types';
import { PrinterStatus, PrinterErrorType, ModelStatus } from '@/types';

export class PrinterService {
  static async installPlastic(printerId: number, plasticId: number): Promise<boolean> {
    try {
      const printer = await printersApi.getById(printerId);
      const plastic = await plasticsApi.getById(plasticId);
      
      if (!printer || !plastic) return false;
      
      if (printer.status === PrinterStatus.PRINTING) return false;
      
      if (plastic.isInstalled && plastic.printerId !== printerId) return false;
      
      await printersApi.update(printerId, { 
        plasticId: plasticId,
        status: PrinterStatus.IDLE 
      });
      
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
  
  static async removePlastic(printerId: number): Promise<boolean> {
    try {
      const printer = await printersApi.getById(printerId);
      if (!printer || !printer.plasticId) return false;
      
      if (printer.status === PrinterStatus.PRINTING) return false;
      
      const plasticId = printer.plasticId;
      
      await printersApi.update(printerId, { 
        plasticId: undefined,
        status: PrinterStatus.IDLE 
      });
      
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
  
  static async addModelToPrinter(printerId: number, modelId: number): Promise<boolean> {
    try {
      const printer = await printersApi.getById(printerId);
      const model = await modelsApi.getById(modelId);
      
      if (!printer || !model) return false;
      
      if (!printer.plasticId) return false;
      
      const plastic = await plasticsApi.getById(printer.plasticId);
      if (!plastic) return false;
      
      if (plastic.length < model.perimeterLength) return false;
      
      await modelsApi.update(modelId, {
        status: ModelStatus.PRINTING,
        printerId: printerId
      });
      
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
  
  static generateRandomError(modelId: number): PrinterError | null {
    if (Math.random() > 0.1) return null;
    
    const errorTypes = Object.values(PrinterErrorType);
    const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    return {
      type: randomType,
      message: `Возникла ошибка: ${randomType}`,
      modelId: modelId
    };
  }
}