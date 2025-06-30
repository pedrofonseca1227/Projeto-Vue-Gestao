<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">➕ Adicionar Produto</h2>

    <form @submit.prevent="salvarProduto" class="card p-4 shadow-sm">
      <div class="row mb-3">
        <div class="col-md-6 mb-3">
          <label class="form-label">Nome</label>
          <input v-model="produto.nome" class="form-control" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Quantidade</label>
          <input type="number" v-model.number="produto.quantidade" class="form-control" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Categoria</label>
          <input v-model="produto.categoria" class="form-control" />
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Descrição</label>
        <textarea v-model="produto.descricao" class="form-control" rows="2"></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Localização</label>
        <input v-model="produto.localizacao" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label">Imagem do Produto</label>
        <input type="file" @change="onFileChange" accept="image/*" class="form-control" />
      </div>

      <div v-if="produto.imagemBase64" class="mb-3 text-center">
        <img :src="produto.imagemBase64" alt="Preview" class="img-preview" />
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-success">Salvar Produto</button>
      </div>
    </form>
  </div>
</template>

<script>
import { db } from '@/firebase/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default {
  data() {
    return {
      produto: {
        nome: '',
        quantidade: 0,
        categoria: '',
        descricao: '',
        localizacao: '',
        data: null,
        imagemBase64: ''
      }
    };
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        this.produto.imagemBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    async salvarProduto() {
      try {
        const dados = {
          ...this.produto,
          data: Timestamp.now()
        };

        await addDoc(collection(db, 'estoque'), dados);
        alert('✅ Produto salvo com sucesso!');
        this.$router.push('/produtos');
      } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('❌ Erro ao salvar. Tente novamente.');
      }
    }
  }
};
</script>

<style scoped>
.img-preview {
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .form-label, .form-control, .btn {
    font-size: 14px;
  }
  h2 {
    font-size: 20px;
  }
}
</style>
