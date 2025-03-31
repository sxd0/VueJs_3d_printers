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
    // Arrange
    const printer = {
      id: 1,
      brand: "Prusa",
      articleNumber: "i3 MK3S+",
      printSpeed: 100,
      status: PrinterStatus.IDLE
    };
    
    // Act
    const wrapper = mount(PrinterForm, {
      props: {
        printer,
        isEditing: true
      }
    });
    
    await nextTick();
    
    // Assert
    expect(wrapper.find("#brand").element.value).toBe("Prusa");
    expect(wrapper.find("#articleNumber").element.value).toBe("i3 MK3S+");
    expect(wrapper.find("#printSpeed").element.value).toBe("100");
  });
  
  it("эмитирует событие cancel при нажатии кнопки отмены", async () => {
    // Arrange
    const wrapper = mount(PrinterForm, {
      props: {
        isEditing: false
      }
    });
    
    // Act
    await wrapper.find(".cancel-btn").trigger("click");
    
    // Assert
    expect(wrapper.emitted()).toHaveProperty("cancel");
  });
  
  it("валидирует форму и отображает ошибки при отправке пустой формы", async () => {
    // Arrange
    const wrapper = mount(PrinterForm, {
      props: {
        isEditing: false
      }
    });
    
    // Вместо мокирования внутреннего метода компонента,
    // мы напрямую вызываем метод handleSubmit
    const originalHandleSubmit = wrapper.vm.handleSubmit;
    
    // Создаем шпион, который просто вызывает оригинальный метод
    wrapper.vm.handleSubmit = vi.fn(() => {
      originalHandleSubmit.call(wrapper.vm);
    });
    
    // Act
    await wrapper.vm.handleSubmit();
    await nextTick();
    
    // Assert
    expect(wrapper.vm.handleSubmit).toHaveBeenCalled();
    // Проверяем, что ошибки сформированы
    expect(Object.keys(wrapper.vm.errors).length).toBeGreaterThan(0);
    // Проверяем, что текст ошибки содержится в компоненте
    expect(wrapper.text()).toContain("обязательна");
  });
  
  it("отправляет событие save с правильными данными при валидной форме", async () => {
    // Arrange
    const wrapper = mount(PrinterForm, {
      props: {
        isEditing: false
      }
    });
    
    // Мокируем validate, чтобы он возвращал true
    wrapper.vm.validate = vi.fn().mockReturnValue(true);
    
    // Act
    await wrapper.find("#brand").setValue("Creality");
    await wrapper.find("#articleNumber").setValue("Ender 3");
    await wrapper.find("#printSpeed").setValue(80);
    
    // Вызываем handleSubmit напрямую
    await wrapper.vm.handleSubmit();
    await nextTick();
    
    // Assert
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