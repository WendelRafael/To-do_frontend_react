// app/index.tsx
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
import api from "../services/api";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      api.defaults.headers.Authorization = `Token ${token}`;
      const res = await api.get("/tasks/");
      setTasks(res.data);
    } catch (err: any) {
      console.error("❌ Erro ao carregar tarefas:", err.response?.data || err.message);
      alert("Erro ao carregar tarefas");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  const handleComplete = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/tasks/${id}/`, { completed: !currentStatus });
      fetchTasks();
    } catch (err) {
      console.error("Erro ao concluir tarefa:", err);
      alert("Erro ao concluir tarefa");
    }
  };

  const handleDelete = async (id: number) => {
    const previousTasks = [...tasks];
    setTasks((cur) => cur.filter((t) => t.id !== id));

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setTasks(previousTasks);
        router.replace("/login");
        return;
      }

      api.defaults.headers.Authorization = `Token ${token}`;
      await api.delete(`/tasks/${id}/`);
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
      setTasks(previousTasks);
      fetchTasks();
    }
  };

  const openEditModal = (id: number, title: string, description: string, date: string) => {
    setEditTaskId(id);
    setEditTitle(title);
    setEditDescription(description || "");
    setEditDate(date || "");
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editTaskId || !editTitle.trim()) {
      alert("Título inválido");
      return;
    }

    try {
      await api.patch(`/tasks/${editTaskId}/`, {
        title: editTitle,
        description: editDescription,
        data: editDate,
      });
      setEditModalVisible(false);
      setEditTaskId(null);
      setEditTitle("");
      setEditDescription("");
      setEditDate("");
      fetchTasks();
    } catch (err) {
      console.error("Erro ao editar tarefa:", err);
      alert("Erro ao editar tarefa");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Tarefas</Text>

      <View style={styles.filters}>
        <Button title="Todos" onPress={() => setFilter("all")} />
        <Button title="Pendentes" onPress={() => setFilter("pending")} />
        <Button title="Concluídos" onPress={() => setFilter("done")} />
      </View>

      <TextInput
        placeholder="Buscar tarefas..."
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={tasks.filter((t) => {
          if (filter === "pending") return !t.completed;
          if (filter === "done") return t.completed;
          return true;
        })}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.taskText, item.completed && styles.taskDone]}>
                {item.title}
              </Text>
              {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => openEditModal(item.id, item.title, item.description, item.data)}
              >
                <Text style={styles.edit}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleComplete(item.id, item.completed)}>
                <Text style={styles.complete}>✅</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/TaskForm")}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Button title="Sair" onPress={handleLogout} />

      {/* Modal de edição */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar tarefa</Text>

            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título"
            />
            <TextInput
              style={styles.modalInput}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Descrição"
            />
            <TextInput
              style={styles.modalInput}
              value={editDate}
              onChangeText={setEditDate}
              placeholder="Data (YYYY-MM-DD)"
            />

            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setEditModalVisible(false)} />
              <Button title="Salvar" onPress={saveEdit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  filters: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  taskText: { fontSize: 18, flex: 1 },
  taskDesc: { fontSize: 14, color: "#555" },
  taskDate: { fontSize: 14, color: "#555" },
  taskDone: { textDecorationLine: "line-through", color: "#999" },
  actions: { flexDirection: "row", gap: 10, marginLeft: 10 },
  edit: { fontSize: 20, marginHorizontal: 5 },
  delete: { fontSize: 20, marginHorizontal: 5 },
  complete: { fontSize: 20, marginHorizontal: 5 },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { fontSize: 30, color: "#fff", fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: 20 },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  modalInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around" },
});
