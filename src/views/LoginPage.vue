<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card" style="width: 100%; max-width: 400px;">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Login</h2>
        <!-- Formulário de login -->
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label">Usuário</label>
            <input
              v-model="username"
              type="text"
              class="form-control"
              id="username"
              placeholder="Digite seu usuário"
              required
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Senha</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              id="password"
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary w-100">
            Entrar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    handleLogin() {
      // Validação de login simples
      if (this.username === 'admin' && this.password === 'senha123') {
        localStorage.setItem('isAuthenticated', 'true');
        this.$router.push('/produtos');
      } else {
        alert('Credenciais inválidas');
      }
    },
  },
};
</script>

<style scoped>
/* Aqui você pode adicionar outros estilos personalizados, se necessário */
</style>
