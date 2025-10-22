<template>
  <div class="card">
    <h2>{{ titulo }}</h2>
    <p>{{ prefixo }}{{ valor }}</p>
  </div>
</template>

<script>
export default {
  props: {
    titulo: String,
    valor: [String, Number],
    prefixo: { type: String, default: '' },
  },
};
</script>

<style scoped>
.card {
  background: #fff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.card h2 {
  font-size: 1.1rem;
  color: #333;
}
.card p {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 10px;
  color: #111;
}
</style>
