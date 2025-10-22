import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import  api  from "../services/api";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("⚠️ Nenhum token encontrado, redirecionando para login");
        router.replace("/login");
        return;
      }
      else
      {
        console.log("✅ Token encontrado:", token);
      }

      // Aplica o token no axios
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
            <Text style={[styles.taskText, item.completed && styles.taskDone]}>
              {item.title}
            </Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("//taskForm")}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  filters: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  taskItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  taskText: { fontSize: 18 },
  taskDone: { textDecorationLine: "line-through", color: "#999" },
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
});
