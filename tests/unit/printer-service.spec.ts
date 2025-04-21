import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrinterService } from "../../src/services/printer-service";
import { printersApi, plasticsApi, modelsApi } from "../../src/services/api";
import { PrinterStatus, ModelStatus, PrinterErrorType } from "../../src/types";

vi.mock("../../src/services/api", () => {
  return {
    printersApi: {
      getById: vi.fn(),
      update: vi.fn()
    },
    plasticsApi: {
      getById: vi.fn(),
      update: vi.fn()
    },
    modelsApi: {
      getById: vi.fn(),
      update: vi.fn()
    }
  };
});

describe("PrinterService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("installPlastic", () => {
    it("должен успешно установить пластик в принтер", async () => {
      const printerId = 1;
      const plasticId = 2;
      
      printersApi.getById.mockResolvedValue({
        id: printerId,
        status: PrinterStatus.IDLE,
        plasticId: null
      });
      
      plasticsApi.getById.mockResolvedValue({
        id: plasticId,
        isInstalled: false
      });
      
      printersApi.update.mockResolvedValue({});
      plasticsApi.update.mockResolvedValue({});
      
      const result = await PrinterService.installPlastic(printerId, plasticId);
      
      expect(result).toBe(true);
      expect(printersApi.update).toHaveBeenCalledWith(printerId, { 
        plasticId: plasticId,
        status: PrinterStatus.IDLE 
      });
      expect(plasticsApi.update).toHaveBeenCalledWith(plasticId, { 
        isInstalled: true,
        printerId: printerId 
      });
    });
    
    it("должен возвращать false, если принтер печатает", async () => {
      const printerId = 1;
      const plasticId = 2;
      
      printersApi.getById.mockResolvedValue({
        id: printerId,
        status: PrinterStatus.PRINTING,
        plasticId: null
      });
      
      plasticsApi.getById.mockResolvedValue({
        id: plasticId,
        isInstalled: false
      });
      
      const result = await PrinterService.installPlastic(printerId, plasticId);
      
      expect(result).toBe(false);
      expect(printersApi.update).not.toHaveBeenCalled();
      expect(plasticsApi.update).not.toHaveBeenCalled();
    });
  });

  describe("removePlastic", () => {
    it("должен успешно извлекать пластик из принтера", async () => {
      const printerId = 1;
      const plasticId = 2;
      
      printersApi.getById.mockResolvedValue({
        id: printerId,
        status: PrinterStatus.IDLE,
        plasticId: plasticId
      });
      
      printersApi.update.mockResolvedValue({});
      plasticsApi.update.mockResolvedValue({});
      
      const result = await PrinterService.removePlastic(printerId);
      
      expect(result).toBe(true);
      expect(printersApi.update).toHaveBeenCalledWith(printerId, { 
        plasticId: undefined,
        status: PrinterStatus.IDLE 
      });
      expect(plasticsApi.update).toHaveBeenCalledWith(plasticId, { 
        isInstalled: false,
        printerId: undefined 
      });
    });
    
    it("должен возвращать false, если принтер печатает", async () => {
      const printerId = 1;
      
      printersApi.getById.mockResolvedValue({
        id: printerId,
        status: PrinterStatus.PRINTING,
        plasticId: 2
      });
      
      const result = await PrinterService.removePlastic(printerId);
      
      expect(result).toBe(false);
      expect(printersApi.update).not.toHaveBeenCalled();
      expect(plasticsApi.update).not.toHaveBeenCalled();
    });
    
    it("должен возвращать false, если пластик не установлен", async () => {
      const printerId = 1;
      
      printersApi.getById.mockResolvedValue({
        id: printerId,
        status: PrinterStatus.IDLE,
        plasticId: undefined
      });
      
      const result = await PrinterService.removePlastic(printerId);
      
      expect(result).toBe(false);
      expect(printersApi.update).not.toHaveBeenCalled();
      expect(plasticsApi.update).not.toHaveBeenCalled();
    });
  });

  describe("addModelToPrinter", () => {
    it("должен успешно добавлять модель в очередь принтера", async () => {
      const printerId = 1;
      const modelId = 2;
      const plasticId = 3;
      
      printersApi.getById.mockResolvedValue({
        id: printerId,
        status: PrinterStatus.IDLE,
        plasticId: plasticId
      });
      
      modelsApi.getById.mockResolvedValue({
        id: modelId,
        perimeterLength: 5,
        status: ModelStatus.CREATED
      });
      
      plasticsApi.getById.mockResolvedValue({
        id: plasticId,
        length: 10
      });
      
      modelsApi.update.mockResolvedValue({});
      printersApi.update.mockResolvedValue({});
      
      const result = await PrinterService.addModelToPrinter(printerId, modelId);
      
      expect(result).toBe(true);
      expect(modelsApi.update).toHaveBeenCalledWith(modelId, {
        status: ModelStatus.PRINTING,
        printerId: printerId
      });
      expect(printersApi.update).toHaveBeenCalledWith(printerId, {
        currentModelId: modelId,
        status: PrinterStatus.PRINTING,
        printingProgress: 0
      });
    });
    
    it("должен возвращать false, если недостаточно пластика", async () => {
      const printerId = 1;
      const modelId = 2;
      const plasticId = 3;
      
      printersApi.getById.mockResolvedValue({
        id: printerId,
        status: PrinterStatus.IDLE,
        plasticId: plasticId
      });
      
      modelsApi.getById.mockResolvedValue({
        id: modelId,
        perimeterLength: 15,
        status: ModelStatus.CREATED
      });
      
      plasticsApi.getById.mockResolvedValue({
        id: plasticId,
        length: 10
      });
      
      const result = await PrinterService.addModelToPrinter(printerId, modelId);
      
      expect(result).toBe(false);
      expect(modelsApi.update).not.toHaveBeenCalled();
      expect(printersApi.update).not.toHaveBeenCalled();
    });
    
    it("должен возвращать false, если пластик не установлен", async () => {
      const printerId = 1;
      const modelId = 2;
      
      printersApi.getById.mockResolvedValue({
        id: printerId,
        status: PrinterStatus.IDLE,
        plasticId: undefined
      });
      
      modelsApi.getById.mockResolvedValue({
        id: modelId,
        perimeterLength: 5,
        status: ModelStatus.CREATED
      });
      
      const result = await PrinterService.addModelToPrinter(printerId, modelId);
      
      expect(result).toBe(false);
      expect(modelsApi.update).not.toHaveBeenCalled();
      expect(printersApi.update).not.toHaveBeenCalled();
    });
  });

  describe("generateRandomError", () => {
    it("должен возвращать ошибку с корректным типом и id модели", () => {
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.05);
      
      const modelId = 5;
      const error = PrinterService.generateRandomError(modelId);
      
      expect(error).not.toBeNull();
      expect(error?.modelId).toBe(modelId);
      expect(Object.values(PrinterErrorType)).toContain(error?.type);
      
      Math.random = originalRandom;
    });
    
    it("должен возвращать null, когда случайное число выше порога", () => {
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.2); 
      
      const modelId = 5;
      const error = PrinterService.generateRandomError(modelId);
      
      expect(error).toBeNull();
      
      Math.random = originalRandom;
    });
  });
});