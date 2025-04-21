import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import PrinterForm from "../../src/components/printers/PrinterForm.vue";
import { PrinterStatus } from "../../src/types";
import { nextTick } from "vue";

describe("PrinterForm.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it("правильно инициализирует данные при редактировании", async () => {
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.IDLE
    };
    
    const wrapper = mount(PrinterForm, {
      props: {
        printer,
        isEditing: true
      }
    });
    
    await nextTick();
    
    expect(wrapper.find("#brand").element.value).toBe("Prusa");
    expect(wrapper.find("#articleNumber").element.value).toBe("i3 MK3S+");
    expect(wrapper.find("#printSpeed").element.value).toBe("100");
  });
  
  it("эмитирует событие cancel при нажатии кнопки отмены", async () => {
    const wrapper = mount(PrinterForm, {
      props: {
        isEditing: false
      }
    });
    
    await wrapper.find(".cancel-btn").trigger("click");
    
    expect(wrapper.emitted()).toHaveProperty("cancel");
  });
  
  it("валидирует форму и отображает ошибки при отправке пустой формы", async () => {
    const wrapper = mount(PrinterForm, {
      props: {
        isEditing: false
      }
    });
    
    const originalHandleSubmit = wrapper.vm.handleSubmit;
    
    wrapper.vm.handleSubmit = vi.fn(() => {
      originalHandleSubmit.call(wrapper.vm);
    });
    
    await wrapper.vm.handleSubmit();
    await nextTick();
    
    expect(wrapper.vm.handleSubmit).toHaveBeenCalled();
    expect(Object.keys(wrapper.vm.errors).length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain("обязательна");
  });
  
  it("отправляет событие save с правильными данными при валидной форме", async () => {
    const wrapper = mount(PrinterForm, {
      props: {
        isEditing: false
      }
    });
    
    wrapper.vm.validate = vi.fn().mockReturnValue(true);
    
    await wrapper.find("#brand").setValue("Creality");
    await wrapper.find("#articleNumber").setValue("Ender 3");
    await wrapper.find("#printSpeed").setValue(80);
    
    await wrapper.vm.handleSubmit();
    await nextTick();
    
    expect(wrapper.emitted()).toHaveProperty("save");
    const saveEvent = wrapper.emitted().save[0][0];
    expect(saveEvent).toEqual({
      brand: "Creality",
      articleNumber: "Ender 3",
      printSpeed: 80,
      status: PrinterStatus.IDLE
    });
  });
});