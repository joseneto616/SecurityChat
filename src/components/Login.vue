<template>
  <div class="login-container d-flex align-items-center justify-content-center min-vh-100">
    <b-card title="Login" class="p-4" style="max-width: 400px; width: 100%">
      <b-form @submit.prevent="handleLogin">
        <b-form-group label="Usuário" label-for="username">
          <b-form-input
            id="username"
            v-model="username"
            type="text"
            placeholder="Digite seu usuário"
            required
          ></b-form-input>
        </b-form-group>

        <b-form-group label="Senha" label-for="password">
          <b-form-input
            id="password"
            v-model="password"
            type="password"
            placeholder="Digite sua senha"
            required
          ></b-form-input>
        </b-form-group>

        <b-button type="submit" variant="primary" class="mt-3 w-100" :disabled="!keyExchangeComplete">
          Entrar
        </b-button>
      </b-form>
    </b-card>
  </div>
</template>


<script>
import crypto from "crypto-browserify";
import { Buffer } from "buffer";

export default {
  data() {
    return {
      username: "jose",
      password: "jose123",
      dhClient: null,
      publicKey: null,
      sharedSecret: null,
      keyExchangeComplete: false
    };
  },
  mounted() {
    this.initiateKeyExchange();
  },
  methods: {
  initializeDH() {
    // Cria a instância do Diffie-Hellman e gera a chave pública
    this.dhClient = crypto.createDiffieHellman(2048); 
    this.publicKey = this.dhClient.generateKeys("hex");
  },
  async initiateKeyExchange() {
    try {
      this.initializeDH();
      
      const keyExchangeURL = "http://localhost:8080/key-exchange";
      const response = await fetch(keyExchangeURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          clientPublicKey: this.publicKey
        })
      });

      if (!response.ok) {
        throw new Error("Falha na troca de chaves");
      }

      const data = await response.json();
      
      const serverPublicKey = data.serverPublicKey;

      // Calcula a chave secreta compartilhada
      this.sharedSecret = this.dhClient.computeSecret(serverPublicKey, "hex", "hex");

      // Armazena a chave compartilhada de forma segura
      sessionStorage.setItem("sharedSecret", this.sharedSecret);

      this.keyExchangeComplete = true;
      console.log("Troca de chaves Diffie-Hellman realizada com sucesso!");

    } catch (error) {
      console.error("Erro na troca de chaves: " + error.message);
      alert("Erro na troca de chaves. Por favor, recarregue a página.");
    }
  },
  encryptCredentials() {
    // Implemente a lógica real de criptografia com a sharedSecret
    return "encrypted_" + this.username + "_" + this.password;
  }
}
};
</script>


<style>
.login-container {
  background-color: #f8f9fa;
}
</style>
