<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-center">Editar Movimentação de Produto</h2>
    <form @submit.prevent="editMovement">
      <div class="mb-3">
        <label for="product" class="form-label">Produto</label>
        <input
          v-model="product"
          type="text"
          id="product"
          class="form-control"
          placeholder="Nome do produto"
          required
        />
      </div>
      <div class="mb-3">
        <label for="employee" class="form-label">Funcionário</label>
        <input
          v-model="employee"
          type="text"
          id="employee"
          class="form-control"
          placeholder="Nome do funcionário"
          required
        />
      </div>
      <div class="mb-3">
        <label for="quantity" class="form-label">Quantidade</label>
        <input
          v-model="quantity"
          type="number"
          id="quantity"
          class="form-control"
          placeholder="Quantidade de produto"
          required
        />
      </div>
      <div class="mb-3">
        <label for="date" class="form-label">Data</label>
        <input
          v-model="date"
          type="date"
          id="date"
          class="form-control"
          required
        />
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Descrição</label>
        <textarea
          v-model="description"
          id="description"
          class="form-control"
          rows="3"
          placeholder="Descrição da movimentação"
          required
        ></textarea>
      </div>
      <button type="submit" class="btn btn-primary w-100">Salvar Movimentação</button>
    </form>
  </div>
</template>

<script>
import { db } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default {
  data() {
    return {
      product: "",
      employee: "",
      quantity: 0,
      date: "",
      description: "",
      movementId: "",  // Para armazenar o ID da movimentação que está sendo editada
    };
  },
  async created() {
    // Pega os dados da movimentação ao carregar a página
    const movementId = this.$route.params.id;
    this.movementId = movementId;

    try {
      const movementRef = doc(db, "estoque", movementId); // Referência ao documento de movimentação
      const movementSnap = await getDoc(movementRef);

      if (movementSnap.exists()) {
        const movement = movementSnap.data();
        this.product = movement.product;
        this.employee = movement.employee;
        this.quantity = movement.quantity;
        this.date = movement.date;
        this.description = movement.description;
      } else {
        console.error("Movimentação não encontrada!");
      }
    } catch (error) {
      console.error("Erro ao carregar dados de movimentação: ", error);
    }
  },
  methods: {
    async editMovement() {
      if (!this.product || !this.employee || !this.quantity || !this.date || !this.description) {
        alert("Por favor, preencha todos os campos!");
        return;
      }

      const updatedMovement = {
        product: this.product,
        employee: this.employee,
        quantity: this.quantity,
        date: this.date,
        description: this.description,
      };

      try {
        const movementRef = doc(db, "movements", this.movementId);
        await updateDoc(movementRef, updatedMovement);

        // Redireciona após salvar
        this.$router.push("/relatorios");
      } catch (error) {
        console.error("Erro ao atualizar movimentação: ", error);
        alert("Erro ao atualizar movimentação!");
      }
    },
  },
};
</script>

<style scoped>
/* Estilos personalizados, se necessário */
</style>
