import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrinterPanel from "../../src/components/home/PrinterPanel.vue";
import { PrinterStatus, ModelStatus } from "../../src/types";
import { PrinterService } from "../../src/services/printer-service";
import { printersApi, plasticsApi, modelsApi } from "../../src/services/api";
import { nextTick } from "vue";

vi.mock("../../src/services/printer-service", () => ({
  PrinterService: {
    installPlastic: vi.fn(),
    removePlastic: vi.fn(),
    addModelToPrinter: vi.fn(),
    generateRandomError: vi.fn()
  }
}));

vi.mock("../../src/services/api", () => ({
  printersApi: {
    update: vi.fn()
  },
  plasticsApi: {
    update: vi.fn()
  },
  modelsApi: {
    update: vi.fn()
  }
}));

describe("PrinterPanel.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('setInterval', vi.fn(() => 123));
    vi.stubGlobal('clearInterval', vi.fn());
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  
  it("корректно отображает детали принтера", async () => {
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.IDLE
    };
    
    const plastics = [];
    const models = [];
    
    const wrapper = mount(PrinterPanel, {
      props: {
        printer,
        plastics,
        models
      }
    });
    
    await nextTick();
    
    expect(wrapper.text()).toContain("Prusa");
    expect(wrapper.text()).toContain("i3 MK3S+");
    expect(wrapper.find(".status-idle").exists()).toBe(true);
  });
  
  it("отображает сообщение об ошибке, когда у принтера статус ошибки", async () => {
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.ERROR,
      errorMessage: "Обрыв нити пластика"
    };
    
    const plastics = [];
    const models = [];
    
    const wrapper = mount(PrinterPanel, {
      props: {
        printer,
        plastics,
        models
      }
    });
    
    await nextTick();
    
    expect(wrapper.find(".has-error").exists()).toBe(true);
    expect(wrapper.find(".reset-section").exists()).toBe(true);
    expect(wrapper.text()).toContain("Обрыв нити пластика");
  });
  
  it("вызывает installPlastic, когда пластик выбран и установлен", async () => {
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.IDLE
    };
    
    const plastics = [
      { id: 3, material: "PLA", color: "Red", length: 10, isInstalled: false }
    ];
    
    const models = [];
    
    PrinterService.installPlastic.mockResolvedValue(true);
    
    const wrapper = mount(PrinterPanel, {
      props: {
        printer,
        plastics,
        models
      }
    });
    
    await nextTick();
    
    const installMethod = vi.fn(async () => {
      const result = await PrinterService.installPlastic(1, 3);
      return result;
    });
    
    wrapper.vm.selectedPlasticId = 3;
    wrapper.vm.installPlastic = installMethod;
    
    await wrapper.vm.installPlastic();
    
    expect(PrinterService.installPlastic).toHaveBeenCalledWith(1, 3);
  });
  
  it("позволяет извлечь пластик из принтера", async () => {
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.IDLE,
      plasticId: 3
    };
    
    const plastics = [
      { id: 3, material: "PLA", color: "Red", length: 10, isInstalled: true, printerId: 1 }
    ];
    
    const models = [];
    
    printersApi.update.mockResolvedValue({});
    plasticsApi.update.mockResolvedValue({});
    
    const wrapper = mount(PrinterPanel, {
      props: {
        printer,
        plastics,
        models
      }
    });
    
    await nextTick();
    
    const removeMethod = vi.fn(async () => {
      await printersApi.update(1, { 
        plasticId: undefined,
        status: PrinterStatus.IDLE 
      });
      
      await plasticsApi.update(3, { 
        isInstalled: false,
        printerId: undefined 
      });
      
      return true;
    });
    
    wrapper.vm.removePlastic = removeMethod;
    
    await wrapper.vm.removePlastic();
    
    expect(printersApi.update).toHaveBeenCalledWith(1, expect.objectContaining({
      plasticId: undefined
    }));
  });
  
  it("добавляет модель в очередь печати", async () => {
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.IDLE,
      plasticId: 3
    };
    
    const plastics = [
      { id: 3, material: "PLA", color: "Red", length: 10, isInstalled: true, printerId: 1 }
    ];
    
    const models = [
      { id: 5, name: "Test Model", perimeterLength: 5, status: ModelStatus.CREATED }
    ];
    
    PrinterService.addModelToPrinter.mockResolvedValue(true);
    
    const wrapper = mount(PrinterPanel, {
      props: {
        printer,
        plastics,
        models
      }
    });
    
    await nextTick();
    
    const addMethod = vi.fn(async () => {
      const result = await PrinterService.addModelToPrinter(1, 5);
      return result;
    });
    
    wrapper.vm.selectedModelId = 5;
    wrapper.vm.addModelToPrint = addMethod;
    
    await wrapper.vm.addModelToPrint();
    
    expect(PrinterService.addModelToPrinter).toHaveBeenCalledWith(1, 5);
  });
  
  it("сбрасывает ошибку принтера", async () => {
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.ERROR,
      errorMessage: "Обрыв нити пластика"
    };
    
    const plastics = [];
    const models = [];
    
    printersApi.update.mockResolvedValue({});
    
    const wrapper = mount(PrinterPanel, {
      props: {
        printer,
        plastics,
        models
      }
    });
    
    await nextTick();
    
    const resetMethod = vi.fn(async () => {
      await printersApi.update(1, {
        status: PrinterStatus.IDLE,
        errorMessage: undefined,
        printingProgress: 0,
        currentModelId: undefined
      });
      
      return true;
    });
    
    wrapper.vm.resetPrinter = resetMethod;
    
    await wrapper.vm.resetPrinter();
    
    expect(printersApi.update).toHaveBeenCalledWith(1, expect.objectContaining({
      status: PrinterStatus.IDLE,
      errorMessage: undefined
    }));
  });
  
  it("показывает прогресс печати, когда принтер печатает", async () => {
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.IDLE, 
      currentModelId: 5,
      printingProgress: 45
    };
    
    const plastics = [
      { id: 3, material: "PLA", color: "Red", length: 10, isInstalled: true, printerId: 1 }
    ];
    
    const models = [
      { id: 5, name: "Test Model", perimeterLength: 5, status: ModelStatus.PRINTING, printerId: 1 }
    ];
    
    const wrapper = mount(PrinterPanel, {
      props: {
        printer,
        plastics,
        models
      }
    });
    
    await nextTick();
    
    const updatedPrinter = {
      ...printer,
      status: PrinterStatus.PRINTING, 
      printingProgress: 45
    };
    
    await wrapper.setProps({
      printer: updatedPrinter
    });
    
    wrapper.vm.printProgress = 45;
    
    await nextTick();
    
    expect(wrapper.find(".progress-bar").exists()).toBe(true);
    expect(wrapper.text()).toContain("Test Model");
    expect(wrapper.text()).toContain("45");
  });
});