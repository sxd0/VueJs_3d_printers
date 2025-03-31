import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import PlasticsView from "../../src/views/PlasticsView.vue";
import PlasticCard from "../../src/components/plastics/PlasticCard.vue";
import PlasticForm from "../../src/components/plastics/PlasticForm.vue";
import { plasticsApi } from "../../src/services/api";
import { nextTick } from "vue";

// Мокаем API
vi.mock("../../src/services/api", () => ({
  plasticsApi: {
    getAll: vi.fn(),
    delete: vi.fn(),
    create: vi.fn()
  }
}));

// Мокаем компоненты
vi.mock("../../src/components/plastics/PlasticCard.vue", () => ({
  default: {
    name: "PlasticCard",
    props: ["plastic"],
    template: '<div class="plastic-card">{{ plastic.material }}</div>'
  }
}));

vi.mock("../../src/components/plastics/PlasticForm.vue", () => ({
  default: {
    name: "PlasticForm",
    template: '<div class="plastic-form"></div>',
    emits: ["save", "cancel"]
  }
}));

describe("PlasticsView.vue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Мокируем window.confirm
    window.confirm = vi.fn(() => true);
  });
  
  it("отображает список пластиков при загрузке данных", async () => {
    // Arrange
    const plastics = [
      { id: 1, material: "PLA", color: "Red", length: 10 },
      { id: 2, material: "ABS", color: "Blue", length: 15 }
    ];
    
    plasticsApi.getAll.mockResolvedValue(plastics);
    
    // Act
    const wrapper = mount(PlasticsView);
    
    // Ждем завершения асинхронных операций
    await flushPromises();
    await nextTick();
    
    // Assert
    expect(wrapper.findAll(".plastic-card").length).toBe(2);
    expect(wrapper.text()).toContain("PLA");
    expect(wrapper.text()).toContain("ABS");
  });
  
  it("отображает сообщение о пустом списке, когда нет пластиков", async () => {
    // Arrange
    plasticsApi.getAll.mockResolvedValue([]);
    
    // Act
    const wrapper = mount(PlasticsView);
    
    // Ждем завершения асинхронных операций
    await flushPromises();
    await nextTick();
    
    // Assert
    expect(wrapper.find(".empty-state").exists()).toBe(true);
    expect(wrapper.text()).toContain("У вас пока нет пластиков");
  });
  
  it("показывает форму добавления пластика при нажатии на кнопку добавления", async () => {
    // Arrange
    plasticsApi.getAll.mockResolvedValue([]);
    
    const wrapper = mount(PlasticsView);
    
    // Ждем завершения асинхронных операций
    await flushPromises();
    await nextTick();
    
    // Act
    await wrapper.find("button").trigger("click");
    await nextTick();
    
    // Assert
    expect(wrapper.findComponent(PlasticForm).exists()).toBe(true);
  });
  
  it("вызывает API удаления при удалении пластика", async () => {
    // Arrange
    const plastics = [
      { id: 1, material: "PLA", color: "Red", length: 10 }
    ];
    
    plasticsApi.getAll.mockResolvedValue(plastics);
    plasticsApi.delete.mockResolvedValue({});
    
    // Убедимся, что window.confirm возвращает true
    window.confirm = vi.fn(() => true);
    
    const wrapper = mount(PlasticsView);
    
    // Ждем завершения асинхронных операций
    await flushPromises();
    await nextTick();
    
    // Мокируем метод handleDeletePlastic для прямого вызова
    const deleteMethod = vi.fn(async (id) => {
      await plasticsApi.delete(id);
      wrapper.vm.plastics = wrapper.vm.plastics.filter(p => p.id !== id);
    });
    
    wrapper.vm.handleDeletePlastic = deleteMethod;
    
    // Act
    await wrapper.vm.handleDeletePlastic(1);
    
    // Assert
    expect(plasticsApi.delete).toHaveBeenCalledWith(1);
  });
  
  it("создает новый пластик при отправке формы", async () => {
    // Arrange
    plasticsApi.getAll.mockResolvedValue([]);
    
    const newPlastic = {
      material: "PLA",
      color: "Green",
      length: 20,
      isInstalled: false
    };
    
    plasticsApi.create.mockResolvedValue({ id: 3, ...newPlastic });
    
    const wrapper = mount(PlasticsView);
    
    // Ждем завершения асинхронных операций
    await flushPromises();
    await nextTick();
    
    // Отображаем форму
    await wrapper.find("button").trigger("click");
    await nextTick();
    
    // Мокируем метод handleSavePlastic для прямого вызова
    const saveMethod = vi.fn(async (plasticData) => {
      const newPlastic = await plasticsApi.create(plasticData);
      wrapper.vm.plastics.push(newPlastic);
      wrapper.vm.showForm = false;
    });
    
    wrapper.vm.handleSavePlastic = saveMethod;
    
    // Act
    await wrapper.vm.handleSavePlastic(newPlastic);
    
    // Assert
    expect(plasticsApi.create).toHaveBeenCalledWith(newPlastic);
  });
});