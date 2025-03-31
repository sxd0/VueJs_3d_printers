import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PlasticCard from "../../src/components/plastics/PlasticCard.vue";
import { nextTick } from "vue";

describe("PlasticCard.vue", () => {
  it("корректно отображает детали пластика", async () => {
    // Arrange
    const plastic = {
      id: 1,
      material: "PLA",
      color: "Red",
      length: 10.5,
      isInstalled: false
    };
    
    // Act
    const wrapper = mount(PlasticCard, {
      props: {
        plastic
      }
    });
    
    await nextTick();
    
    // Assert
    expect(wrapper.text()).toContain("PLA");
    expect(wrapper.text()).toContain("Red");
    expect(wrapper.text()).toContain("10.5");
  });
  
  it("показывает значок установки, когда пластик установлен", async () => {
    // Arrange
    const plastic = {
      id: 1,
      material: "PLA",
      color: "Red",
      length: 10.5,
      isInstalled: true
    };
    
    // Act
    const wrapper = mount(PlasticCard, {
      props: {
        plastic
      }
    });
    
    await nextTick();
    
    // Assert
    expect(wrapper.find(".installed-badge").exists()).toBe(true);
    expect(wrapper.text()).toContain("Установлен в принтер");
  });
  
  it("вызывает событие delete при нажатии на кнопку удаления", async () => {
    // Arrange
    const plastic = {
      id: 1,
      material: "PLA",
      color: "Red",
      length: 10.5,
      isInstalled: false
    };
    
    const wrapper = mount(PlasticCard, {
      props: {
        plastic
      }
    });
    
    // Act
    await wrapper.find(".delete-btn").trigger("click");
    
    // Assert
    expect(wrapper.emitted()).toHaveProperty("delete");
    expect(wrapper.emitted().delete[0]).toEqual([1]);
  });
  
  it("блокирует кнопку удаления, когда пластик установлен", async () => {
    // Arrange
    const plastic = {
      id: 1,
      material: "PLA",
      color: "Red",
      length: 10.5,
      isInstalled: true
    };
    
    // Act
    const wrapper = mount(PlasticCard, {
      props: {
        plastic
      }
    });
    
    await nextTick();
    
    // Assert
    expect(wrapper.find(".delete-btn").attributes("disabled")).toBeDefined();
    expect(wrapper.find(".busy-message").exists()).toBe(true);
  });
  
  it("отображает индикатор длины пластика", async () => {
    // Arrange
    const plastic = {
      id: 1,
      material: "PLA",
      color: "Red",
      length: 50,
      isInstalled: false
    };
    
    // Act
    const wrapper = mount(PlasticCard, {
      props: {
        plastic
      }
    });
    
    await nextTick();
    
    // Assert
    expect(wrapper.find(".length-bar").exists()).toBe(true);
    expect(wrapper.find(".length-fill").attributes("style")).toContain("width: 50%");
  });
});