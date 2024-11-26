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
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import BigInt from 'big-integer'

export default {
  data() {
    return {
      username: "jose",
      password: "jose123",
      key:{
        publick: null,
        privatek: null
      },
      serverPublicKey: null,
      sharedSecret: null,
      diffieHelmanParams: {
        prime: BigInt(23),
        generator: BigInt(5)
      },
      keyExchangeComplete: false
    };
  },
  mounted() {
    this.initiateKeyExchange();
  },
  methods: {
    generateKeys() {
      const privatek = BigInt.randBetween('1',this.diffieHelmanParams.prime.minus(1));
      const publick = this.diffieHelmanParams.generator.modPow(privatek, this.diffieHelmanParams.prime);

      return {publick, privatek};
    },

    async deriveSharedSecret(publicKey, privateKey) {
      if (!publicKey || !privateKey) {
        throw new Error("Chave pública ou privada não fornecida");
      }
      const sharedSecret = publicKey.modPow(privateKey, this.diffieHelmanParams.prime);
      return sharedSecret.toString();
    },

    generateKeyPair() {
      this.key = this.generateKeys();
    },

    async initiateKeyExchange() {
      try {
        this.generateKeyPair();

        if (!this.key || !this.key.publick) {
          console.error("Chave pública não gerada");
          return;
        }

        const keyExchangeURL = "http://localhost:8080/key-exchange";
        const response = await fetch(keyExchangeURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            clientPublicKey: this.key.publick.toString()
          })
        });

        const data = await response.json();

        console.log('Server Public Key:', data.serverPublicKey);
        console.log('Server Public Key Type:', typeof data.serverPublicKey);

        this.serverPublicKey = BigInt(data.serverPublicKey);

        this.sharedSecret = await this.deriveSharedSecret(this.serverPublicKey, this.key.privatek);

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
