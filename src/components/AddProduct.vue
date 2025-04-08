<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Registrar Movimentação de Estoque</h2>

    <!-- Card de Formulário -->
    <div class="card p-4 shadow-sm">
      <form @submit.prevent="registrarestoque">
        
        <!-- Campo Produto -->
        <div class="mb-3">
          <label for="produto" class="form-label">Produto</label>
          <input v-model="estoque.produto" type="text" class="form-control" id="produto" @blur="carregarEstoqueAtual" placeholder="Digite o nome do produto" required />
        </div>

        <!-- Campo Quantidade -->
        <div class="mb-3">
          <label for="quantidade" class="form-label">Quantidade</label>
          <div class="d-flex">
            <input v-model.number="estoque.quantidade" :class="{'is-invalid': estoque.quantidade > estoqueAtual && estoque.tipo === 'saida'}" type="number" class="form-control" id="quantidade" placeholder="Quantidade" required />
            <span class="ms-2 align-self-center">Estoque Atual: {{ estoqueAtual }}</span>
          </div>
        </div>

        <!-- Botões Entrada e Saída -->
        <div class="mb-3 d-flex justify-content-between">
          <button type="button" 
            :class="{'btn-success': estoque.tipo === 'entrada', 'btn-outline-success': estoque.tipo !== 'entrada'}" 
            class="btn w-48" 
            @click="estoque.tipo = 'entrada'">
            <i class="bi bi-arrow-down-circle"></i> Entrada
          </button>
          <button type="button" 
            :class="{'btn-danger': estoque.tipo === 'saida', 'btn-outline-danger': estoque.tipo !== 'saida'}" 
            class="btn w-48" 
            @click="estoque.tipo = 'saida'">
            <i class="bi bi-arrow-up-circle"></i> Saída
          </button>
        </div>

        <!-- Campo Localização -->
        <div class="mb-3">
          <label for="localizacao" class="form-label">Localização</label>
          <textarea v-model="estoque.localizacao" class="form-control" id="localizacao" rows="1" placeholder="Localização do produto" required></textarea>
        </div>

        <!-- Campo Descrição -->
        <div class="mb-3">
          <label for="descricao" class="form-label">Descrição</label>
          <textarea v-model="estoque.descricao" class="form-control" id="descricao" rows="3" placeholder="Descrição da movimentação" required></textarea>
        </div>

        <!-- Campo Funcionário -->
        <div class="mb-3">
          <label for="funcionario" class="form-label">Funcionário</label>
          <input v-model="estoque.funcionario" type="text" class="form-control" id="funcionario" placeholder="Nome do funcionário" required />
        </div>

        <!-- Botão de Submissão -->
        <button type="submit" class="btn btn-primary w-100 mt-3">Registrar Movimentação</button>
      </form>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase/firebase";
import { collection, addDoc, getDoc, doc, setDoc } from "firebase/firestore";

export default {
  data() {
    return {
      estoque: {
        produto: "",
        quantidade: null,
        tipo: "entrada", // Entrada ou Saída
        localizacao: "",
        descricao: "",
        funcionario: "",
        data: new Date().toISOString(),
      },
      estoqueAtual: 0, // Estado para armazenar a quantidade atual do produto
    };
  },
  methods: {
    async registrarestoque() {
      try {
        if (!this.estoque.produto || !this.estoque.quantidade || !this.estoque.descricao || !this.estoque.funcionario || !this.estoque.localizacao) {
          alert("Preencha todos os campos!");
          return;
        }

        const produtoRef = doc(db, "estoque", this.estoque.produto);
        const produtoSnap = await getDoc(produtoRef);

        let estoqueAtual = 0;

        if (produtoSnap.exists()) {
          estoqueAtual = produtoSnap.data().quantidade || 0;
          this.estoque.localizacao = produtoSnap.data().localizacao || this.estoque.localizacao;
        } else {
          await setDoc(produtoRef, {
            nome: this.estoque.produto,
            quantidade: 0,
            localizacao: this.estoque.localizacao,
          });
          estoqueAtual = 0;
        }

        let novaQuantidade = estoqueAtual;

        if (this.estoque.tipo === "entrada") {
          novaQuantidade += this.estoque.quantidade;
        } else if (this.estoque.tipo === "saida") {
          if (estoqueAtual < this.estoque.quantidade) {
            alert("Estoque insuficiente para essa saída!");
            return;
          }
          novaQuantidade -= this.estoque.quantidade;
        }

        await setDoc(produtoRef, {
          nome: this.estoque.produto,
          quantidade: novaQuantidade,
          localizacao: this.estoque.localizacao,
        }, { merge: true });

        await addDoc(collection(db, "movimentacao_estoque"), {
          produto: this.estoque.produto,
          quantidade: this.estoque.quantidade,
          tipo: this.estoque.tipo,
          localizacao: this.estoque.localizacao,
          descricao: this.estoque.descricao,
          funcionario: this.estoque.funcionario,
          data: new Date().toISOString(),
        });

        alert("Movimentação registrada com sucesso!");
        this.resetForm();
      } catch (error) {
        console.error("Erro ao registrar movimentação:", error);
        alert("Erro ao registrar movimentação. Tente novamente.");
      }
    },

    resetForm() {
      this.estoque = {
        produto: "",
        quantidade: null,
        tipo: "entrada",
        localizacao: "",
        descricao: "",
        funcionario: "",
        data: new Date().toISOString(),
      };
    },

    async carregarEstoqueAtual() {
      try {
        if (this.estoque.produto) {
          const produtoRef = doc(db, "estoque", this.estoque.produto);
          const produtoSnap = await getDoc(produtoRef);

          if (produtoSnap.exists()) {
            this.estoqueAtual = produtoSnap.data().quantidade || 0;
          } else {
            this.estoqueAtual = 0;
          }
        }
      } catch (error) {
        console.error("Erro ao carregar estoque atual:", error);
      }
    },
  },
};
</script>

<style scoped>
/* Adicionando sombras e bordas arredondadas para os campos */
.card {
  border-radius: 15px;
  background-color: #f8f9fa;
}

/* Melhorando o foco nos campos de entrada */
input:focus, textarea:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  border-color: #007bff;
}

/* Adicionando uma borda vermelha para o campo com erro */
.is-invalid {
  border-color: #dc3545;
}
</style>
