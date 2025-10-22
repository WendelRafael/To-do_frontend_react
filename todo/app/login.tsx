import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // 🔹 Corrigido: endpoint precisa ser /api/token/
      const res = await api.post("/token/", { username, password });

      const token = res.data.token;
      if (!token) {
        Alert.alert("Erro", "Token não recebido do servidor.");
        console.log("Resposta recebida:", res.data);
        return;
      }

      await AsyncStorage.setItem("token", token);
      console.log("✅ Token salvo com sucesso:", token);

      // Redireciona para a tela inicial
      router.replace("/");
    } catch (err: any) {
      console.error("❌ Erro ao fazer login:", err.response?.data || err.message);
      Alert.alert("Erro", "Usuário ou senha incorretos.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Usuário"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Senha"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Entrar" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => router.push("/register")}>
        Criar conta
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
  link: { textAlign: "center", marginTop: 10, color: "blue" },
});
