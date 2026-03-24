<template>
  <div class="container mt-5">
    <h2 class="fw-bold text-center mb-4">📆 Cadastro de Gastos por Ciclo Semestral</h2>

    <form @submit.prevent="registrarCiclo" class="card p-4 shadow-sm mb-4">
      <div class="row mb-3">
        <div class="col-md-4">
          <label class="form-label">Ano</label>
          <input
            type="number"
            min="2020"
            v-model.number="form.ano"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-4">
          <label class="form-label">Semestre</label>
          <select v-model.number="form.semestre" class="form-select" required>
            <option :value="1">1º Semestre (Jan-Jun)</option>
            <option :value="2">2º Semestre (Jul-Dez)</option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Status do Ciclo</label>
          <select v-model="form.status" class="form-select" required>
            <option value="ABERTO">ABERTO</option>
            <option value="FECHADO">FECHADO</option>
          </select>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Início do Ciclo</label>
          <input :value="datasSemestre.inicio" type="date" class="form-control bg-light" disabled />
        </div>

        <div class="col-md-6">
          <label class="form-label">Fim do Ciclo</label>
          <input :value="datasSemestre.fim" type="date" class="form-control bg-light" disabled />
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-4">
          <label class="form-label">Média de Animais no Período</label>
          <input
            type="number"
            min="1"
            v-model.number="form.totalAnimais"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-4">
          <label class="form-label">Dias do Ciclo</label>
          <input :value="diasDoSemestre" class="form-control bg-light" disabled />
        </div>

        <div class="col-md-4">
          <label class="form-label">Custo por Cabeça</label>
          <input
            :value="formatarValor(custoPorCabecaPreview)"
            class="form-control bg-light"
            disabled
          />
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-4" v-for="campo in camposGasto" :key="campo.nome">
          <label class="form-label">{{ campo.label }} (R$)</label>
        
          <div class="input-group">
            <span class="input-group-text">R$</span>
            <MoneyInput
              v-model="form[campo.nome]"
              class="form-control"
              required
            />
          </div>
        </div>
      </div>

      <div class="mt-3">
        <label class="form-label">Observações (opcional)</label>
        <textarea v-model="form.observacoes" class="form-control" rows="2"></textarea>
      </div>

      <div class="alert alert-info mt-3">
        <strong>Total de Gastos:</strong> R$ {{ formatarValor(totalGasto) }}
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-primary" :disabled="salvando">
          {{ salvando ? "Salvando..." : "💾 Registrar Ciclo" }}
        </button>
      </div>
    </form>

    <div
      v-if="mensagem"
      class="alert text-center"
      :class="mensagem.startsWith('✅') ? 'alert-success' : 'alert-danger'"
    >
      {{ mensagem }}
    </div>

    <div class="row mb-4" v-if="ciclos.length">
      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">📁 Total de Ciclos</h6>
          <h3 class="fw-bold text-primary">{{ ciclos.length }}</h3>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">🔓 Abertos</h6>
          <h3 class="fw-bold text-success">{{ totalAbertos }}</h3>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">🔒 Fechados</h6>
          <h3 class="fw-bold text-danger">{{ totalFechados }}</h3>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-center shadow-sm p-3">
          <h6 class="text-muted">💰 Gasto Total</h6>
          <h3 class="fw-bold text-warning">R$ {{ formatarValor(gastoTotalCiclos) }}</h3>
        </div>
      </div>
    </div>

    <div class="card p-3 mt-4">
      <h5 class="fw-bold mb-3">📁 Ciclos Registrados</h5>

      <div class="table-responsive" v-if="ciclos.length">
        <table class="table table-bordered table-striped">
          <thead class="table-dark">
            <tr>
              <th>Ano</th>
              <th>Semestre</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Animais</th>
              <th>Total (R$)</th>
              <th>Custo/Cabeça</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="ciclo in ciclos" :key="ciclo.id">
              <td>{{ ciclo.ano }}</td>
              <td>{{ ciclo.semestre }}º</td>
              <td>{{ formatarData(ciclo.inicio) }}</td>
              <td>{{ formatarData(ciclo.fim) }}</td>
              <td>{{ ciclo.totalAnimais }}</td>
              <td>R$ {{ formatarValor(ciclo.total) }}</td>
              <td>R$ {{ formatarValor(ciclo.custoPorCabeca) }}</td>
              <td>
                <span
                  class="badge"
                  :class="ciclo.status === 'ABERTO' ? 'bg-success' : 'bg-secondary'"
                >
                  {{ ciclo.status }}
                </span>
              </td>
              <td>
                <button
                  v-if="ciclo.status === 'ABERTO'"
                  class="btn btn-sm btn-outline-danger"
                  @click="alterarStatusCiclo(ciclo, 'FECHADO')"
                >
                  Fechar
                </button>

                <button
                  v-else
                  class="btn btn-sm btn-outline-success"
                  @click="alterarStatusCiclo(ciclo, 'ABERTO')"
                >
                  Reabrir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-muted">Nenhum ciclo registrado ainda.</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { db } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";

export default {
  name: "CicloGastos",
  setup() {
    const anoAtual = new Date().getFullYear();

    const formPadrao = () => ({
      ano: anoAtual,
      semestre: 1,
      totalAnimais: 0,
      racao: 0,
      energia: 0,
      funcionario: 0,
      diesel: 0,
      manutencao: 0,
      outros: 0,
      observacoes: "",
      status: "ABERTO",
    });

    const form = ref(formPadrao());

    const camposGasto = [
      { nome: "racao", label: "Ração" },
      { nome: "energia", label: "Energia" },
      { nome: "funcionario", label: "Funcionário" },
      { nome: "diesel", label: "Diesel" },
      { nome: "manutencao", label: "Manutenção" },
      { nome: "outros", label: "Outros" },
    ];

    const mensagem = ref("");
    const ciclos = ref([]);
    const salvando = ref(false);

    const getDatasSemestre = (ano, semestre) => {
      if (Number(semestre) === 1) {
        return {
          inicio: `${ano}-01-01`,
          fim: `${ano}-06-30`,
        };
      }

      return {
        inicio: `${ano}-07-01`,
        fim: `${ano}-12-31`,
      };
    };

    const datasSemestre = computed(() =>
      getDatasSemestre(form.value.ano, form.value.semestre)
    );

    const diasDoSemestre = computed(() => {
      const inicio = new Date(`${datasSemestre.value.inicio}T00:00:00`);
      const fim = new Date(`${datasSemestre.value.fim}T00:00:00`);
      return Math.floor((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
    });

    const totalGasto = computed(() => {
      return camposGasto.reduce((total, campo) => {
        return total + Number(form.value[campo.nome] || 0);
      }, 0);
    });

    const custoPorCabecaPreview = computed(() => {
      const animais = Number(form.value.totalAnimais || 0);
      if (!animais || animais <= 0) return 0;
      return totalGasto.value / animais;
    });

    const totalAbertos = computed(() =>
      ciclos.value.filter((c) => c.status === "ABERTO").length
    );

    const totalFechados = computed(() =>
      ciclos.value.filter((c) => c.status === "FECHADO").length
    );

    const gastoTotalCiclos = computed(() =>
      ciclos.value.reduce((total, ciclo) => total + Number(ciclo.total || 0), 0)
    );

    const formatarData = (timestamp) => {
      if (!timestamp) return "-";
      return timestamp?.toDate?.().toLocaleDateString("pt-BR") || "-";
    };

    const formatarValor = (valor) => {
      const num = Number(valor || 0);
      return num.toFixed(2);
    };

    const cicloJaExiste = () => {
      return ciclos.value.some(
        (c) => Number(c.ano) === Number(form.value.ano) && Number(c.semestre) === Number(form.value.semestre)
      );
    };

    const registrarCiclo = async () => {
      mensagem.value = "";

      if (!form.value.ano || Number(form.value.ano) < 2020) {
        mensagem.value = "❌ Informe um ano válido.";
        return;
      }

      if (![1, 2].includes(Number(form.value.semestre))) {
        mensagem.value = "❌ Informe um semestre válido.";
        return;
      }

      if (!form.value.totalAnimais || Number(form.value.totalAnimais) <= 0) {
        mensagem.value = "❌ Informe uma média válida de animais.";
        return;
      }

      if (cicloJaExiste()) {
        mensagem.value = "❌ Já existe um ciclo cadastrado para esse ano e semestre.";
        return;
      }

      salvando.value = true;

      try {
        const inicio = Timestamp.fromDate(new Date(`${datasSemestre.value.inicio}T00:00:00`));
        const fim = Timestamp.fromDate(new Date(`${datasSemestre.value.fim}T00:00:00`));

        const dados = {
          ano: Number(form.value.ano),
          semestre: Number(form.value.semestre),
          inicio,
          fim,
          totalAnimais: Number(form.value.totalAnimais),
          racao: Number(form.value.racao || 0),
          energia: Number(form.value.energia || 0),
          funcionario: Number(form.value.funcionario || 0),
          diesel: Number(form.value.diesel || 0),
          manutencao: Number(form.value.manutencao || 0),
          outros: Number(form.value.outros || 0),
          observacoes: form.value.observacoes || "",
          total: Number(totalGasto.value.toFixed(2)),
          custoPorCabeca: Number(custoPorCabecaPreview.value.toFixed(2)),
          status: form.value.status,
          tipoCiclo: "SEMESTRAL",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        await addDoc(collection(db, "CiclosGastos"), dados);

        mensagem.value = "✅ Ciclo semestral registrado com sucesso!";
        await carregarCiclos();
        form.value = formPadrao();
      } catch (error) {
        console.error("Erro ao registrar ciclo:", error);
        mensagem.value = "❌ Erro ao registrar ciclo.";
      } finally {
        salvando.value = false;
        setTimeout(() => (mensagem.value = ""), 4000);
      }
    };

    const carregarCiclos = async () => {
      try {
        const q = query(collection(db, "CiclosGastos"), orderBy("inicio", "desc"));
        const snapshot = await getDocs(q);

        ciclos.value = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          status: docSnap.data().status || "ABERTO",
          custoPorCabeca: docSnap.data().custoPorCabeca || 0,
          ano: docSnap.data().ano || null,
          semestre: docSnap.data().semestre || null,
        }));
      } catch (error) {
        console.error("Erro ao carregar ciclos:", error);
        mensagem.value = "❌ Erro ao carregar ciclos.";
      }
    };

    const alterarStatusCiclo = async (ciclo, novoStatus) => {
      try {
        await updateDoc(doc(db, "CiclosGastos", ciclo.id), {
          status: novoStatus,
          updatedAt: Timestamp.now(),
        });

        mensagem.value = `✅ Ciclo ${novoStatus === "FECHADO" ? "fechado" : "reaberto"} com sucesso!`;
        await carregarCiclos();
      } catch (error) {
        console.error("Erro ao alterar status do ciclo:", error);
        mensagem.value = "❌ Erro ao alterar status do ciclo.";
      }

      setTimeout(() => (mensagem.value = ""), 4000);
    };

    onMounted(() => {
      carregarCiclos();
    });

    return {
      form,
      camposGasto,
      totalGasto,
      custoPorCabecaPreview,
      registrarCiclo,
      mensagem,
      ciclos,
      formatarData,
      formatarValor,
      salvando,
      totalAbertos,
      totalFechados,
      gastoTotalCiclos,
      alterarStatusCiclo,
      datasSemestre,
      diasDoSemestre,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 1000px;
}

h2,
h5 {
  color: #004080;
}

.card {
  border-radius: 12px;
  border: 1px solid #dfe3e6;
}

.form-label {
  font-weight: 600;
  color: #333;
}

input,
textarea,
select {
  border-radius: 8px;
}

.btn-primary {
  font-weight: bold;
  border-radius: 8px;
  padding: 10px;
  font-size: 1rem;
}

.alert-info {
  border-radius: 10px;
  background-color: #eaf4ff;
  border: 1px solid #b3daff;
  color: #004080;
  font-size: 1rem;
}

.alert-success,
.alert-danger {
  border-radius: 8px;
  font-weight: 500;
}

.table {
  font-size: 0.92rem;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
}

.badge {
  font-size: 0.82rem;
}
</style>