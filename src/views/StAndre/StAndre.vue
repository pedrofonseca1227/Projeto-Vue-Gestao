<template>
  <div class="container mt-5">
    <!-- Título e Data -->
    <div class="text-center mb-4">
      <h1 class="fw-bold">Sistema de Gestão de Gado</h1>
      <p class="text-muted">{{ dataAtualFormatada }}</p>
    </div>

    <!-- Mensagem de boas-vindas -->
    <div class="alert alert-success text-center">
      Bem-vindo! Utilize os atalhos abaixo para gerenciar os animais da fazenda com mais agilidade.
    </div>

    <!-- Cartões de Acesso Rápido -->
    <div class="row text-center mb-5">
      <div class="col-md-4 col-12 mb-3">
        <router-link to="/contagemPasto" class="card-link">
          <div class="card atalho shadow-sm">
            <div class="card-body">
              <h5 class="card-title">📋 Contagem no Pasto</h5>
              <p class="card-text">Visualize os bovinos atualmente no pasto.</p>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-md-4 col-12 mb-3">
        <router-link to="/add-pasto" class="card-link">
          <div class="card atalho shadow-sm">
            <div class="card-body">
              <h5 class="card-title">➕ Adicionar Animal</h5>
              <p class="card-text">Cadastrar novo animal no sistema.</p>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-md-4 col-12 mb-3">
        <router-link to="/relatoriosanaliticos" class="card-link">
          <div class="card atalho shadow-sm">
            <div class="card-body">
              <h5 class="card-title">📋 Relatórios</h5>
              <p class="card-text">Visualizar análises</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Resumo Pasto -->
    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h4 class="mb-4">📊 Resumo Pasto</h4>
        <p>
          Vacas: <strong>{{ resumo.vacas }}</strong> |
          Vacas S/B: <strong>{{ resumo.vacasSN }}</strong> |
          Touros: <strong>{{ resumo.touros }}</strong> |
          Bezerros Machos: <strong>{{ resumo.bezerrosMacho }}</strong> |
          Bezerros Fêmeas: <strong>{{ resumo.bezerrosFemea }}</strong> |
          Bezerros Desmama: <strong>{{ resumo.bezerrosDesmama }}</strong>
        </p>
      </div>
    </div>

    <!-- Resumo Confinamento -->
    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h4 class="mb-4">📊 Resumo Confinamento</h4>
        <p>
          Vacas/Fêmeas: <strong>{{ resumoConfinamento.femeas }}</strong> |
          Bois/Machos: <strong>{{ resumoConfinamento.machos }}</strong> |
          Total: <strong>{{ totalAnimaisConfinamento }}</strong>
        </p>
      </div>
    </div>

    <!-- Resumo Geral -->
    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h4 class="mb-4">📊 Resumo Geral</h4>
        <p>
          Total Pasto: <strong>{{ totalBovinos }}</strong> |
          Total Confinamento: <strong>{{ totalAnimaisConfinamento }}</strong> |
          Total St André: <strong>{{ totalStAndre }}</strong> |
          Total Geral:
          <strong>{{ totalBovinos + totalAnimaisConfinamento + totalStAndre }}</strong>
        </p>
      </div>
    </div>

    <!-- Últimos Animais Cadastrados -->
    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="mb-3 text-center">🆕 Últimos Animais Cadastrados Pasto</h4>
        <div class="table-responsive">
          <table class="table table-bordered table-sm text-center align-middle">
            <thead class="table-light">
              <tr>
                <th>Nome</th>
                <th>Sexo</th>
                <th>Raça</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(animal, index) in ultimosAnimais" :key="index">
                <td>{{ animal.nome || '-' }}</td>
                <td>{{ animal.sexo || '-' }}</td>
                <td>{{ animal.raca || '-' }}</td>
                <td>{{ animal.origem || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import jsPDF from "jspdf";
import logoImage from "@/assets/LogoPdf.jpg";

export default {
  setup() {
    const bovinos = ref([]); // GadoPasto
    const lotesConfinamento = ref([]); // LotesConfinamento
    const stAndre = ref([]); // GadoPastoStAndre

    let unsubscribePasto = null;
    let unsubscribeConfinamento = null;
    let unsubscribeStAndre = null;

    // 🔥 Carregar dados
    onMounted(() => {
      const pastoRef = collection(db, "GadoPasto");
      const confinamentoRef = collection(db, "LotesConfinamento");
      const stAndreRef = collection(db, "GadoPastoStAndre");

      unsubscribePasto = onSnapshot(pastoRef, (snapshot) => {
        bovinos.value = snapshot.docs.map((doc) => doc.data());
      });

      unsubscribeConfinamento = onSnapshot(confinamentoRef, (snapshot) => {
        lotesConfinamento.value = snapshot.docs.map((doc) => doc.data());
      });

      unsubscribeStAndre = onSnapshot(stAndreRef, (snapshot) => {
        stAndre.value = snapshot.docs.map((doc) => doc.data());
      });
    });

    onUnmounted(() => {
      if (unsubscribePasto) unsubscribePasto();
      if (unsubscribeConfinamento) unsubscribeConfinamento();
      if (unsubscribeStAndre) unsubscribeStAndre();
    });

    // 📊 Resumo Pasto
    const resumo = computed(() => {
      let vacas = 0,
        vacasSN = 0,
        touros = 0,
        bezerrosMacho = 0,
        bezerrosFemea = 0,
        bezerrosDesmama = 0;

      bovinos.value.forEach((b) => {
        const nome = b.nome?.toLowerCase() || "";
        const sexo = b.sexo?.trim().toLowerCase();

        if (nome.includes("vaca") && !nome.includes("s/b")) vacas++;
        else if (nome.includes("vaca") && nome.includes("s/b")) vacasSN++;
        else if (nome.includes("touro")) touros++;
        else if (nome.includes("bezerro") && sexo === "fêmea") bezerrosFemea++;

        if (nome.includes("bezerro") && sexo === "macho") {
          if (nome.includes("desmama")) bezerrosDesmama++;
          else bezerrosMacho++;
        }
      });

      return {
        vacas,
        vacasSN,
        touros,
        bezerrosMacho,
        bezerrosFemea,
        bezerrosDesmama,
      };
    });

    const totalBovinos = computed(() => bovinos.value.length);

    // 📦 Resumo Confinamento
    const resumoConfinamento = computed(() => {
      let machos = 0;
      let femeas = 0;

      lotesConfinamento.value.forEach((lote) => {
        const categoria = lote.categoria?.trim().toUpperCase();
        const quantidade = lote.quantidade || 0;

        if (categoria === "MACHO") machos += quantidade;
        else if (categoria === "FEMEA") femeas += quantidade;
      });

      return { machos, femeas };
    });

    const totalAnimaisConfinamento = computed(() =>
      lotesConfinamento.value.reduce(
        (sum, lote) => sum + (lote.quantidade || 0),
        0
      )
    );

    // 🐄 Resumo St. André
    const totalStAndre = computed(() => stAndre.value.length);

    // 📅 Data
    const dataAtualFormatada = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // 🧾 Exportar PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
      const marginLeft = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      const img = new Image();
      img.src = logoImage;

      doc.addImage(img, "JPEG", marginLeft, 10, 30, 30);
      doc.setFontSize(20);
      doc.setTextColor(33, 37, 41);
      doc.text("Relatório de Contagem Geral de Bovinos", centerX, 45, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Resumo geral da contagem de bovinos cadastrados no sistema.",
        marginLeft,
        60,
        { maxWidth: 170 }
      );

      doc.setLineWidth(0.5);
      doc.line(marginLeft, 70, pageWidth - marginLeft, 70);

      let y = 80;
      const r = resumo.value;

      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text("Resumo de Contagem", marginLeft, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`• Vacas: ${r.vacas}`, marginLeft, y);
      y += 10;
      doc.text(`• Touros: ${r.touros}`, marginLeft, y);
      y += 10;
      doc.text(`• Total Pasto: ${totalBovinos.value}`, marginLeft, y);
      y += 10;
      doc.text(`• Total Confinamento: ${totalAnimaisConfinamento.value}`, marginLeft, y);
      y += 10;
      doc.text(`• Total St. André: ${totalStAndre.value}`, marginLeft, y);
      y += 10;
      doc.text(
        `• Total Geral: ${
          totalBovinos.value + totalAnimaisConfinamento.value + totalStAndre.value
        }`,
        marginLeft,
        y
      );

      doc.save("Resumo_Home.pdf");
    };

    const ultimosAnimais = computed(() =>
      [...bovinos.value].slice(-5).reverse()
    );

    return {
      resumo,
      resumoConfinamento,
      totalBovinos,
      totalAnimaisConfinamento,
      totalStAndre,
      exportToPDF,
      dataAtualFormatada,
      ultimosAnimais,
    };
  },
};
</script>

<style scoped>
.card.atalho {
  transition: 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}
.card.atalho:hover {
  background-color: #f8f9fa;
  transform: translateY(-4px);
}
.card-title {
  font-weight: bold;
  font-size: 1.2rem;
}
.card-text {
  font-size: 0.95rem;
}
.table td,
.table th {
  vertical-align: middle;
}
@media (max-width: 768px) {
  .card-title {
    font-size: 1rem;
  }
  .card-text {
    font-size: 0.85rem;
  }
  h1 {
    font-size: 1.5rem;
  }
  .container {
    padding: 0 1rem;
  }
}
</style>
