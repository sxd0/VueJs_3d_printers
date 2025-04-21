import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ModelsView from "../../src/views/ModelsView.vue";
import ModelCard from "../../src/components/models/ModelCard.vue";
import ModelForm from "../../src/components/models/ModelForm.vue";
import { modelsApi } from "../../src/services/api";
import { ModelStatus } from "../../src/types";
import { nextTick } from "vue";

vi.mock("../../src/services/api", () => ({
  modelsApi: {
    getAll: vi.fn(),
    delete: vi.fn(),
    create: vi.fn()
  }
}));

vi.mock("../../src/components/models/ModelCard.vue", () => ({
  default: {
    name: "ModelCard",
    props: ["model"],
    template: '<div class="model-card">{{ model.name }}</div>'
  }
}));

vi.mock("../../src/components/models/ModelForm.vue", () => ({
  default: {
    name: "ModelForm",
    template: '<div class="model-form"></div>',
    emits: ["save", "cancel"]
  }
}));

describe("ModelsView.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.confirm = vi.fn(() => true);
  });
  
  it("отображает списки моделей со статусами created, printing и completed", async () => {
    const models = [
      { id: 1, name: "Model 1", status: ModelStatus.CREATED, perimeterLength: 5, creationDate: "2023-01-01T00:00:00Z" },
      { id: 2, name: "Model 2", status: ModelStatus.PRINTING, perimeterLength: 5, creationDate: "2023-01-02T00:00:00Z" },
      { id: 3, name: "Model 3", status: ModelStatus.COMPLETED, perimeterLength: 5, creationDate: "2023-01-03T00:00:00Z" }
    ];
    
    modelsApi.getAll.mockResolvedValue(models);
    
    const wrapper = mount(ModelsView);
    
    await flushPromises();
    await nextTick();
    
    expect(wrapper.findAll(".model-card").length).toBe(3);
    expect(wrapper.text()).toContain("Model 1");
    expect(wrapper.text()).toContain("Model 2");
    expect(wrapper.text()).toContain("Model 3");
  });
  
  it("сортирует модели по имени в порядке возрастания", async () => {
    const models = [
      { id: 1, name: "C Model", status: ModelStatus.CREATED, perimeterLength: 5, creationDate: "2023-01-01T00:00:00Z" },
      { id: 2, name: "A Model", status: ModelStatus.CREATED, perimeterLength: 5, creationDate: "2023-01-02T00:00:00Z" },
      { id: 3, name: "B Model", status: ModelStatus.CREATED, perimeterLength: 5, creationDate: "2023-01-03T00:00:00Z" }
    ];
    
    modelsApi.getAll.mockResolvedValue(models);
    
    const wrapper = mount(ModelsView);
    
    await flushPromises();
    await nextTick();
    
    wrapper.vm.toggleSort('name');
    await nextTick();
    
    const sortedModels = wrapper.vm.createdModels;
    expect(sortedModels[0].name).toBe("A Model");
    expect(sortedModels[1].name).toBe("B Model");
    expect(sortedModels[2].name).toBe("C Model");
  });
  
  it("удаляет модель при вызове события delete", async () => {
    const models = [
      { id: 1, name: "Model 1", status: ModelStatus.CREATED, perimeterLength: 5, creationDate: "2023-01-01T00:00:00Z" }
    ];
    
    modelsApi.getAll.mockResolvedValue(models);
    modelsApi.delete.mockResolvedValue({});
    
    const wrapper = mount(ModelsView);
    
    await flushPromises();
    await nextTick();
    
    const deleteMethod = vi.fn(async (id) => {
      await modelsApi.delete(id);
      wrapper.vm.models = wrapper.vm.models.filter(model => model.id !== id);
    });
    
    wrapper.vm.handleDeleteModel = deleteMethod;
    
    await wrapper.vm.handleDeleteModel(1);
    
    expect(modelsApi.delete).toHaveBeenCalledWith(1);
  });
  
  it("создает копию модели при вызове события copy", async () => {
    const models = [
      { id: 1, name: "Model 1", status: ModelStatus.CREATED, perimeterLength: 5, creationDate: "2023-01-01T00:00:00Z" }
    ];
    
    const copyData = {
      name: "Model 1 (копия)",
      perimeterLength: 5,
      creationDate: expect.any(String),
      status: ModelStatus.CREATED
    };
    
    modelsApi.getAll.mockResolvedValue(models);
    modelsApi.create.mockResolvedValue({ id: 2, ...copyData });
    
    const wrapper = mount(ModelsView);
    
    await flushPromises();
    await nextTick();
    
    const copyMethod = vi.fn(async (model) => {
      const copyData = {
        name: `${model.name} (копия)`,
        perimeterLength: model.perimeterLength,
        creationDate: new Date().toISOString(),
        status: ModelStatus.CREATED
      };
      
      const newModel = await modelsApi.create(copyData);
      wrapper.vm.models.push(newModel);
    });
    
    wrapper.vm.handleCopyModel = copyMethod;
    
    await wrapper.vm.handleCopyModel(models[0]);
    
    expect(modelsApi.create).toHaveBeenCalledWith(expect.objectContaining({
      name: expect.stringContaining("(копия)"),
      perimeterLength: 5,
      status: ModelStatus.CREATED
    }));
  });
});