<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2 class="text-center mb-4">🔐 Acesso à Fazenda</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group mb-3">
          <label for="email" class="form-label">E-mail</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="form-control"
            placeholder="Digite seu e-mail"
            required
          />
        </div>
        <div class="form-group mb-4">
          <label for="password" class="form-label">Senha</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="form-control"
            placeholder="Digite sua senha"
            required
          />
        </div>
        <button type="submit" class="btn btn-login w-100">Entrar</button>
        <p v-if="erro" class="text-danger text-center mt-3">{{ erro }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebase';

export default {
  data() {
    return {
      email: '',
      password: '',
      erro: '',
    };
  },
  methods: {
    async handleLogin() {
      try {
        this.erro = '';
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push('/home');
      } catch (error) {
        this.erro = '❌ E-mail ou senha incorretos.';
        console.error('Erro de login:', error.code);
      }
    },
  },
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e6f0ff;
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.btn-login {
  background-color: #007bff;
  color: white;
  font-weight: 600;
  border: none;
}

.btn-login:hover {
  background-color: #0056b3;
}
</style>
