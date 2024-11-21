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
import { createDiffieHellman } from 'diffie-hellman-js';

export default {
  data() {
    return {
      username: "jose",
      password: "jose123",
      publicKey: null,
      sharedSecret: null,
      keyExchangeComplete: false
    };
  },
  mounted() {
    this.initiateKeyExchange();
  },
  methods: {
    generateKeyPair() {
      // Gera um par de chaves Diffie-Hellman real
      this.dh = createDiffieHellman(2048);
      this.publicKey = this.dh.getPublicKey('base64');
    },

    async initiateKeyExchange() {
      try {
        this.generateKeyPair();

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

        // Calcula a chave secreta compartilhada real
        this.sharedSecret = this.dh.computeSecret(data.serverPublicKey, 'base64', 'hex');

        // Armazena a chave compartilhada de forma segura
        sessionStorage.setItem("sharedSecret", this.sharedSecret);

        this.keyExchangeComplete = true;
        console.log("Troca de chaves concluída com sucesso!");

      } catch (error) {
        console.error("Erro na troca de chaves: " + error.message);
        alert("Erro na troca de chaves. Por favor, recarregue a página.");
      }
    },

    encryptCredentials() {
      // Use a chave compartilhada para criptografar as credenciais
      // Você pode usar CryptoJS ou outra biblioteca para isso
      const message = this.username + ':' + this.password;
      return CryptoJS.AES.encrypt(message, this.sharedSecret).toString();
    },

    async handleLogin() {
      if (!this.keyExchangeComplete) {
        console.error("A troca de chaves ainda não foi concluída");
        return;
      }

      try {
        const encryptedCredentials = this.encryptCredentials();

        const response = await fetch('http://localhost:8080/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            encryptedCredentials: encryptedCredentials
          }),
        });

        if (!response.ok) {
          throw new Error('Falha no login');
        }

        const data = await response.json();
        console.log('Login bem-sucedido:', data);

        // Aqui você pode adicionar lógica adicional após o login bem-sucedido
        // Por exemplo, redirecionar para outra página ou atualizar o estado da aplicação

      } catch (error) {
        console.error('Erro durante o login:', error);
        alert('Falha no login. Por favor, tente novamente.');
      }
    },
  }
};
</script>


<style>
.login-container {
  background-color: #f8f9fa;
}
</style>
