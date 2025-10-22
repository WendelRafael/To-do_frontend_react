// app/taskForm.tsx
import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function TaskForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [title, setTitle] = useState("");

  // Carregar tarefa existente se estiver editando
  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`http://127.0.0.1:8000/api/tasks/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setTitle(res.data.title);
    } catch (error) {
      console.log(error);
      alert("Erro ao carregar tarefa.");
    }
  };

  const saveTask = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      if (id) {
        // Editar tarefa
        await axios.put(
          `http://127.0.0.1:8000/api/tasks/${id}/`,
          { title },
          { headers: { Authorization: `Token ${token}` } }
        );
      } else {
        // Criar tarefa
        await axios.post(
          "http://127.0.0.1:8000/api/tasks/",
          { title },
          { headers: { Authorization: `Token ${token}` } }
        );
      }

      router.push("/"); // Voltar para Home
    } catch (error) {
      console.log(error);
      alert("Erro ao salvar tarefa.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Título da tarefa"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <Button title="Salvar" onPress={saveTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
});
