export interface Plastic {
    id: number;
    material: string;
    color: string;
    length: number;
    isInstalled?: boolean;
    printerId?: number;
  }
  
  export enum ModelStatus {
    CREATED = 'created',
    PRINTING = 'printing',
    COMPLETED = 'completed'
  }
  
  export interface Model {
    id: number;
    name: string;
    perimeterLength: number;
    creationDate: string;
    status: ModelStatus;
    plasticColor?: string;
    printerId?: number;
  }
  
  export enum PrinterStatus {
    IDLE = 'idle',
    PRINTING = 'printing',
    ERROR = 'error'
  }
  
  export interface Printer {
    id: number;
    brand: string;
    articleNumber: string;
    printSpeed: number;
    plasticId?: number;
    currentModelId?: number;
    printingProgress?: number;
    status: PrinterStatus;
    errorMessage?: string;
  }
  
  export enum PrinterErrorType {
    PLASTIC_BREAK = 'Обрыв нити пластика',
    OVERHEAT = 'Перегрев принтера',
    MODEL_DETACHED = 'Отклеилась модель от основания'
  }
  
  export interface PrinterError {
    type: PrinterErrorType;
    message: string;
    modelId: number;
    remainingLength?: number;
  }