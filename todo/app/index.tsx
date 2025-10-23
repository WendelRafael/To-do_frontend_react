import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import  api  from "../services/api"; // seu axios configurado

export default function Index() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [searchDate, setSearchDate] = useState(""); // 🔍 novo campo para busca por data
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.get("/tasks/", {
        headers: { Authorization: `Token ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      Alert.alert("Erro", "Não foi possível carregar as tarefas.");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Erro", "O título é obrigatório.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const data = { title, description: desc, data: date };

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}/`, data, {
          headers: { Authorization: `Token ${token}` },
        });
        Alert.alert("Sucesso", "Tarefa atualizada com sucesso!");
      } else {
        await api.post("/tasks/", data, {
          headers: { Authorization: `Token ${token}` },
        });
        Alert.alert("Sucesso", "Tarefa criada com sucesso!");
      }

      setTitle("");
      setDesc("");
      setDate("");
      setEditingTask(null);
      setModalVisible(false);
      fetchTasks();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      Alert.alert("Erro", "Não foi possível salvar a tarefa.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await api.delete(`/tasks/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setTasks(tasks.filter((t) => t.id !== id));
      Alert.alert("Sucesso", "Tarefa excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      Alert.alert("Erro", "Não foi possível excluir a tarefa.");
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setTitle(task.title);
    setDesc(task.description);
    setDate(task.data || "");
    setModalVisible(true);
  };

  const handleToggleComplete = async (task: any) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await api.patch(
        `/tasks/${task.id}/`,
        { completed: !task.completed },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      fetchTasks();
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status da tarefa.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.push("/login");
  };

  // 🔍 Filtro local (título, descrição, data e status)
  const filteredTasks = tasks
    .filter((task) => {
      const term = search.toLowerCase();
      return (
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
      );
    })
    .filter((task) =>
      task.data
        ? task.data.toLowerCase().includes(searchDate.toLowerCase())
        : true
    )
    .filter((task) => {
      if (filter === "completed") return task.completed === true;
      if (filter === "pending") return task.completed === false;
      return true;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Tarefas</Text>

      {/* 🔘 Botões de filtro */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text style={styles.filterText}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "pending" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("pending")}
        >
          <Text style={styles.filterText}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "completed" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("completed")}
        >
          <Text style={styles.filterText}>Concluídas</Text>
        </TouchableOpacity>
      </View>

      {/* 🔎 Campo de busca por título/descrição */}
      <TextInput
        placeholder="Buscar por título ou descrição..."
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      {/* 🗓️ Campo de busca por data */}
      <TextInput
        placeholder="Buscar por data..."
        style={styles.input}
        value={searchDate}
        onChangeText={setSearchDate}
      />

      {/* Lista de tarefas */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.taskCard,
              item.completed && { backgroundColor: "#DFF0D8" },
            ]}
          >
            <View style={styles.taskHeader}>
              <Text
                style={[
                  styles.taskTitle,
                  item.completed && { textDecorationLine: "line-through" },
                ]}
              >
                {item.title}
              </Text>
            </View>
            <Text style={styles.taskDesc}>{item.description}</Text>
            {item.data && <Text style={styles.taskDate}>{item.data}</Text>}

            {/* Botões alinhados à direita */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleToggleComplete(item)}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: item.completed ? "#FFC107" : "#4CAF50",
                  },
                ]}
              >
                <Text style={styles.buttonText}>
                  {item.completed ? "↺" : "✓"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={[styles.actionBtn, { backgroundColor: "#2196F3" }]}
              >
                <Text style={styles.buttonText}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={[styles.actionBtn, { backgroundColor: "#F44336" }]}
              >
                <Text style={styles.buttonText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Button title="Nova Tarefa" onPress={() => setModalVisible(true)} />
        <br/>
      <Button title="Sair" onPress={handleLogout} color="#666" />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
          </Text>

          <TextInput
            placeholder="Título"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            placeholder="Descrição"
            style={styles.input}
            value={desc}
            onChangeText={setDesc}
          />
          <TextInput
            placeholder="Data (opcional)"
            style={styles.input}
            value={date}
            onChangeText={setDate}
          />

          <Button title="Salvar" onPress={handleSave} />
          <br/>
          <Button title="Cancelar" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F2F2F2" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#ddd",
  },
  filterButtonActive: {
    backgroundColor: "#2196F3",
  },
  filterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taskTitle: { fontSize: 18, fontWeight: "bold" },
  taskDesc: { color: "#666", marginTop: 4 },
  taskDate: { color: "#999", fontSize: 12, marginTop: 4 },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
