<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Lista de Produtos</h2>
    
    <!-- Campo de Pesquisa -->
    <div class="row mb-3">
      <div class="col-md-6 offset-md-3">
        <input v-model="filtro.nome" type="text" class="form-control" placeholder="Pesquisar por nome do produto" />
      </div>
    </div>
    
    <!-- Botão de Adicionar Produto -->
    <div class="text-end mb-3">
      <button @click="adicionarProduto" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Adicionar Produto
      </button>
    </div>

    <!-- Tabela de Produtos -->
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Última Localização</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="produtosFiltrados.length === 0">
            <td colspan="4" class="text-center">Nenhum produto encontrado</td>
          </tr>
          <tr v-for="produto in produtosFiltrados" :key="produto.id">
            <td>{{ produto.nome }}</td>
            <td>{{ produto.quantidade }}</td>
            <td>{{ produto.localizacao }}</td>
            <td>
              <button @click="excluirProduto(produto.id)" class="btn btn-danger btn-sm">
                <i class="bi bi-trash"></i> Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase/firebase"; 
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

export default {
  data() {
    return {
      produtos: [],
      filtro: {
        nome: "",
      },
    };
  },
  async created() {
    this.carregarProdutos();
  },
  computed: {
    produtosFiltrados() {
      return this.produtos.filter(produto => {
        return produto.nome.toLowerCase().includes(this.filtro.nome.toLowerCase());
      });
    },
  },
  methods: {
    adicionarProduto() {
      this.$router.push("/adicionar-produto");
    },
    async excluirProduto(id) {
      if (confirm("Tem certeza que deseja excluir este produto?")) {
        try {
          await deleteDoc(doc(db, "estoque", id));
          this.carregarProdutos(); // Recarrega a lista de produtos
          alert("Produto excluído com sucesso!");
        } catch (error) {
          console.error("Erro ao excluir produto:", error);
          alert("Erro ao excluir o produto. Tente novamente.");
        }
      }
    },
    async carregarProdutos() {
      try {
        const querySnapshot = await getDocs(collection(db, "estoque"));
        this.produtos = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome,
            quantidade: data.quantidade,
            localizacao: data.localizacao,
          };
        });
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    },
  },
};
</script>

<style scoped>
.table th, .table td {
  text-align: center;
}
.table th {
  background-color: #f8f9fa;
  color: #495057;
}
.table td {
  font-size: 0.9rem;
}
.text-center {
  text-align: center;
}
.text-end {
  text-align: end;
}
</style>
