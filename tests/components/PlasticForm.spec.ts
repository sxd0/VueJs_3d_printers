import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import PlasticForm from "../../src/components/plastics/PlasticForm.vue";
import { nextTick } from "vue";

describe("PlasticForm.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it("эмитирует событие cancel при нажатии кнопки отмены", async () => {
    const wrapper = mount(PlasticForm);
    
    await wrapper.find(".cancel-btn").trigger("click");
    
    expect(wrapper.emitted()).toHaveProperty("cancel");
  });
  
  it("валидирует форму и отображает ошибки при отправке пустой формы", async () => {
    const wrapper = mount(PlasticForm);
    
    const originalHandleSubmit = wrapper.vm.handleSubmit;
    
    wrapper.vm.handleSubmit = vi.fn(() => {
      originalHandleSubmit.call(wrapper.vm);
    });
    
    await wrapper.vm.handleSubmit();
    await nextTick();
    
    expect(wrapper.vm.handleSubmit).toHaveBeenCalled();
    expect(wrapper.text()).toContain("обязателен");
  });
  
  it("проверяет длину нити при валидации", async () => {
    const wrapper = mount(PlasticForm);
    
    await wrapper.find("#material").setValue("PLA");
    await wrapper.find("#color").setValue("Red");
    await wrapper.find("#length").setValue(-1);
    
    const isValid = wrapper.vm.validate();
    await nextTick();
    
    expect(isValid).toBe(false);
    expect(wrapper.vm.errors.length).toBeTruthy();
  });
  
  it("отправляет событие save с правильными данными при валидной форме", async () => {
    const wrapper = mount(PlasticForm);
    
    wrapper.vm.validate = vi.fn().mockReturnValue(true);
    
    await wrapper.find("#material").setValue("PLA");
    await wrapper.find("#color").setValue("Red");
    await wrapper.find("#length").setValue(10);
    
    await wrapper.vm.handleSubmit();
    await nextTick();
    
    expect(wrapper.emitted()).toHaveProperty("save");
    const saveEvent = wrapper.emitted().save[0][0];
    expect(saveEvent.material).toBe("PLA");
    expect(saveEvent.color).toBe("Red");
    expect(saveEvent.length).toBe(10);
    expect(saveEvent.isInstalled).toBe(false);
  });
});