import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ModelCard from "../../src/components/models/ModelCard.vue";
import { ModelStatus } from "../../src/types";
import { nextTick } from "vue";

describe("ModelCard.vue", () => {
  it("корректно отображает детали модели", async () => {
    // Arrange
    const model = {
      id: 1,
      name: "Test Model",
      perimeterLength: 10.5,
      creationDate: "2023-01-01T12:00:00Z",
      status: ModelStatus.CREATED
    };
    
    // Act
    const wrapper = mount(ModelCard, {
      props: {
        model
      }
    });
    
    await nextTick();
    
    // Assert
    expect(wrapper.text()).toContain("Test Model");
    expect(wrapper.text()).toContain("10.5");
    expect(wrapper.text()).toContain("Создана");
  });
  
  it("вызывает событие delete при нажатии на кнопку удаления", async () => {
    // Arrange
    const model = {
      id: 1,
      name: "Test Model",
      perimeterLength: 10.5,
      creationDate: "2023-01-01T12:00:00Z",
      status: ModelStatus.CREATED
    };
    
    const wrapper = mount(ModelCard, {
      props: {
        model
      }
    });
    
    // Act
    await wrapper.find(".delete-btn").trigger("click");
    
    // Assert
    expect(wrapper.emitted()).toHaveProperty("delete");
    expect(wrapper.emitted().delete[0]).toEqual([1]);
  });
  
  it("отображает цвет пластика для готовых моделей", async () => {
    // Arrange
    const model = {
      id: 1,
      name: "Test Model",
      perimeterLength: 10.5,
      creationDate: "2023-01-01T12:00:00Z",
      status: ModelStatus.COMPLETED,
      plasticColor: "Red"
    };
    
    // Act
    const wrapper = mount(ModelCard, {
      props: {
        model
      }
    });
    
    await nextTick();
    
    // Assert
    expect(wrapper.text()).toContain("Red");
    expect(wrapper.find(".color-dot").exists()).toBe(true);
  });
  
  it("показывает кнопку копирования только для созданных моделей", async () => {
    // Arrange
    const createdModel = {
      id: 1,
      name: "Created Model",
      perimeterLength: 10.5,
      creationDate: "2023-01-01T12:00:00Z",
      status: ModelStatus.CREATED
    };
    
    const completedModel = {
      id: 2,
      name: "Completed Model",
      perimeterLength: 10.5,
      creationDate: "2023-01-01T12:00:00Z",
      status: ModelStatus.COMPLETED
    };
    
    // Act
    const createdWrapper = mount(ModelCard, {
      props: {
        model: createdModel
      }
    });
    
    const completedWrapper = mount(ModelCard, {
      props: {
        model: completedModel
      }
    });
    
    await nextTick();
    
    // Assert
    expect(createdWrapper.find(".copy-btn").exists()).toBe(true);
    expect(completedWrapper.find(".copy-btn").exists()).toBe(false);
  });
});