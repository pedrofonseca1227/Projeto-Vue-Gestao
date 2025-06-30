<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">📦 Lista de Produtos</h2>

    <!-- Pesquisa -->
    <div class="row mb-3">
      <div class="col-md-6 offset-md-3">
        <input v-model="filtro" class="form-control" placeholder="🔍 Buscar por nome" />
      </div>
    </div>

    <!-- Botão adicionar -->
    <div class="text-end mb-3">
      <button @click="adicionarProduto" class="btn btn-success">
        ➕ Adicionar Produto
      </button>
    </div>

    <!-- Tabela -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead class="table-dark">
          <tr>
            <th>Imagem</th>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Localização</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="produtosFiltrados.length === 0">
            <td colspan="8" class="text-center text-muted">Nenhum produto encontrado</td>
          </tr>
          <tr v-for="p in produtosFiltrados" :key="p.id">
            <td>
              <img v-if="p.imagemBase64" :src="p.imagemBase64" class="img-produto" />
              <span v-else class="text-muted">Sem imagem</span>
            </td>
            <td>{{ p.nome }}</td>
            <td>{{ p.quantidade }}</td>
            <td>{{ p.categoria }}</td>
            <td>{{ p.descricao }}</td>
            <td>{{ p.localizacao }}</td>
            <td>{{ formatarData(p.data) }}</td>
            <td>
              <button @click="excluirProduto(p.id)" class="btn btn-sm btn-danger">
                🗑️ Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default {
  data() {
    return {
      produtos: [],
      filtro: ''
    };
  },
  computed: {
    produtosFiltrados() {
      return this.produtos.filter(p =>
        p.nome.toLowerCase().includes(this.filtro.toLowerCase())
      );
    }
  },
  methods: {
    async carregarProdutos() {
      const snap = await getDocs(collection(db, 'estoque'));
      this.produtos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    formatarData(data) {
      return data?.toDate().toLocaleDateString('pt-BR') || '-';
    },
    adicionarProduto() {
      this.$router.push('/adicionar-produto');
    },
    async excluirProduto(id) {
      if (confirm('Deseja excluir este produto?')) {
        await deleteDoc(doc(db, 'estoque', id));
        this.carregarProdutos();
      }
    }
  },
  created() {
    this.carregarProdutos();
  }
};
</script>

<style scoped>
.table th, .table td {
  text-align: center;
  vertical-align: middle;
}

.img-produto {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}
</style>
