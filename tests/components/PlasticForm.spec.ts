import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import PlasticForm from "../../src/components/plastics/PlasticForm.vue";
import { nextTick } from "vue";

describe("PlasticForm.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it("эмитирует событие cancel при нажатии кнопки отмены", async () => {
    // Arrange
    const wrapper = mount(PlasticForm);
    
    // Act
    await wrapper.find(".cancel-btn").trigger("click");
    
    // Assert
    expect(wrapper.emitted()).toHaveProperty("cancel");
  });
  
  it("валидирует форму и отображает ошибки при отправке пустой формы", async () => {
    // Arrange
    const wrapper = mount(PlasticForm);
    
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
    // Проверяем, что текст сообщения об ошибке отображается
    expect(wrapper.text()).toContain("обязателен");
  });
  
  it("проверяет длину нити при валидации", async () => {
    // Arrange
    const wrapper = mount(PlasticForm);
    
    // Act
    await wrapper.find("#material").setValue("PLA");
    await wrapper.find("#color").setValue("Red");
    await wrapper.find("#length").setValue(-1);
    
    // Вызываем validate напрямую
    const isValid = wrapper.vm.validate();
    await nextTick();
    
    // Assert
    expect(isValid).toBe(false);
    expect(wrapper.vm.errors.length).toBeTruthy();
  });
  
  it("отправляет событие save с правильными данными при валидной форме", async () => {
    // Arrange
    const wrapper = mount(PlasticForm);
    
    // Мокируем validate, чтобы он возвращал true
    wrapper.vm.validate = vi.fn().mockReturnValue(true);
    
    // Act
    await wrapper.find("#material").setValue("PLA");
    await wrapper.find("#color").setValue("Red");
    await wrapper.find("#length").setValue(10);
    
    // Вызываем handleSubmit напрямую
    await wrapper.vm.handleSubmit();
    await nextTick();
    
    // Assert
    expect(wrapper.emitted()).toHaveProperty("save");
    const saveEvent = wrapper.emitted().save[0][0];
    expect(saveEvent.material).toBe("PLA");
    expect(saveEvent.color).toBe("Red");
    expect(saveEvent.length).toBe(10);
    expect(saveEvent.isInstalled).toBe(false);
  });
});