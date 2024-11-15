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

        <b-button type="submit" variant="primary" class="mt-3 w-100">Entrar</b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    async handleLogin() {
      try {
        const apiURL = "http://localhost:8080/user/login";

        const response = await fetch(apiURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        if (response != "user login successful!") {
          throw new Error("Usuário ou senha incorretos.");
        }

        const data = await response.json();
        alert("Login bem-sucedido!");

      } catch (error) {
        alert(error.message);
      }
    }
  }
};
</script>

<style>
.login-container {
  background-color: #f8f9fa;
}
</style>
