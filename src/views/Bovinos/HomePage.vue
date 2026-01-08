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

    <!-- 🔹 Botão novo: PDF só dos Resumos -->
    <div class="text-end mb-3">
      <button class="btn btn-outline-danger" @click="exportToPDFResumos">
        🧾 Exportar PDF (Somente Resumos)
      </button>
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

    <!-- ✅ NOVO: Resumo St André (igual do Pasto + Bois) -->
    <div class="card shadow-sm mb-4">
      <div class="card-body text-center">
        <h4 class="mb-4">📊 Resumo St. André</h4>
        <p>
          Vacas: <strong>{{ resumoStAndre.vacas }}</strong> |
          Novilhas: <strong>{{ resumoStAndre.novilha }}</strong> |
          Vacas S/B: <strong>{{ resumoStAndre.vacasSN }}</strong> |
          Touros: <strong>{{ resumoStAndre.touros }}</strong> |
          Bois: <strong>{{ resumoStAndre.bois }}</strong> |
          Bezerros Machos: <strong>{{ resumoStAndre.bezerrosMacho }}</strong> |
          Bezerros Fêmeas: <strong>{{ resumoStAndre.bezerrosFemea }}</strong> |
          Bezerros Desmama: <strong>{{ resumoStAndre.bezerrosDesmama }}</strong>
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
          Total: <strong>{{ totalAnimais }}</strong>
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
          Total St. André: <strong>{{ totalStAndre }}</strong> |
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
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import jsPDF from 'jspdf'
import logoImage from '@/assets/LogoPdf.jpg'

export default {
  setup() {
    const bovinos = ref([]) // Pasto
    const lotesConfinamento = ref([]) // Confinamento
    const stAndre = ref([]) // ✅ St André (lista completa)

    let unsubscribePasto = null
    let unsubscribeConfinamento = null
    let unsubscribeStAndre = null

    onMounted(() => {
      // Pasto
      unsubscribePasto = onSnapshot(collection(db, 'GadoPasto'), (snapshot) => {
        bovinos.value = snapshot.docs.map((doc) => doc.data())
      })

      // Confinamento
      unsubscribeConfinamento = onSnapshot(collection(db, 'LotesConfinamento'), (snapshot) => {
        lotesConfinamento.value = snapshot.docs.map((doc) => doc.data())
      })

      // ✅ St André
      unsubscribeStAndre = onSnapshot(collection(db, 'GadoPastoStAndre'), (snapshot) => {
        stAndre.value = snapshot.docs.map((doc) => doc.data())
      })
    })

    onUnmounted(() => {
      if (unsubscribePasto) unsubscribePasto()
      if (unsubscribeConfinamento) unsubscribeConfinamento()
      if (unsubscribeStAndre) unsubscribeStAndre()
    })

    // ===== Resumo Pasto =====
    const resumo = computed(() => {
      let vacas = 0,
        vacasSN = 0,
        touros = 0,
        bezerrosMacho = 0,
        bezerrosFemea = 0,
        bezerrosDesmama = 0

      bovinos.value.forEach((b) => {
        const nome = b.nome?.toLowerCase() || ''
        const sexo = b.sexo?.trim().toLowerCase()

        if (nome.includes('vaca') && !nome.includes('s/b')) vacas++
        else if (nome.includes('vaca') && nome.includes('s/b')) vacasSN++
        else if (nome.includes('touro')) touros++
        else if (nome.includes('bezerro') && sexo === 'fêmea') bezerrosFemea++

        if (nome.includes('bezerro') && sexo === 'macho') {
          if (nome.includes('desmama')) bezerrosDesmama++
          else bezerrosMacho++
        }
      })

      return { vacas, vacasSN, touros, bezerrosMacho, bezerrosFemea, bezerrosDesmama }
    })

    const totalBovinos = computed(() => bovinos.value.length)

    // ===== Resumo Confinamento =====
    const resumoConfinamento = computed(() => {
      let machos = 0
      let femeas = 0

      lotesConfinamento.value.forEach((lote) => {
        const categoria = lote.categoria?.trim().toUpperCase()
        const quantidade = lote.quantidade || 0

        if (categoria === 'MACHO') machos += quantidade
        else if (categoria === 'FEMEA') femeas += quantidade
      })

      return { machos, femeas }
    })

    const totalAnimaisConfinamento = computed(() =>
      lotesConfinamento.value.reduce((sum, lote) => sum + (lote.quantidade || 0), 0)
    )

    // ===== ✅ Resumo St André (igual Pasto + Bois) =====
    const resumoStAndre = computed(() => {
      let vacas = 0,
        novilha = 0,
        vacasSN = 0,
        touros = 0,
        bois = 0,
        bezerrosMacho = 0,
        bezerrosFemea = 0,
        bezerrosDesmama = 0

      stAndre.value.forEach((b) => {
        const nome = (b.nome || '').toLowerCase()
        const sexo = (b.sexo || '').toLowerCase()

        if (nome.includes('vaca') && !nome.includes('s/b')) {
          vacas++
          return
        }

        if (nome.includes('novilha')) {
          novilha++
          return
        }

        if (nome.includes('vaca') && nome.includes('s/b')) {
          vacasSN++
          return
        }

        if (nome.includes('touro')) {
          touros++
          return
        }

        if (nome.includes('bezerro')) {
          if (sexo === 'macho') {
            if (nome.includes('desmama')) bezerrosDesmama++
            else bezerrosMacho++
          } else if (sexo === 'fêmea' || sexo === 'femea') {
            bezerrosFemea++
          }
          return
        }

        // ✅ Bois: macho adulto (não touro, não bezerro)
        if (sexo === 'macho' && !nome.includes('bezerro') && !nome.includes('touro')) {
          bois++
          return
        }
      })

      return { vacas, novilha, vacasSN, touros, bois, bezerrosMacho, bezerrosFemea, bezerrosDesmama }
    })

    const totalStAndre = computed(() => stAndre.value.length)

    // Data
    const dataAtualFormatada = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // ✅ PDF só com os resumos
    const exportToPDFResumos = () => {
      const doc = new jsPDF();
      const marginLeft = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;
        
      // 🔹 FUNÇÃO DE LIMPEZA (AQUI MESMO)
      const limparTextoPDF = (txt = "") => {
        return txt
          .replace(/[^\x20-\x7EÀ-ÿ]/g, "") // remove símbolos estranhos
          .replace(/\s+/g, " ")
          .trim();
      };
    
      const img = new Image();
      img.src = logoImage;
    
      doc.addImage(img, "JPEG", marginLeft, 10, 30, 30);
    
      doc.setFontSize(18);
      doc.text(
        limparTextoPDF("Relatório - Resumos do Sistema"),
        centerX,
        25,
        { align: "center" }
      );
    
      doc.setFontSize(11);
      doc.text(
        limparTextoPDF(`Data: ${dataAtualFormatada}`),
        centerX,
        33,
        { align: "center" }
      );
    
      let y = 45;
    
      // 🔹 Resumo Pasto
      doc.setFontSize(13);
      doc.text(limparTextoPDF("Resumo Pasto"), marginLeft, y);
      y += 8;
    
      doc.setFontSize(11);
      doc.text(limparTextoPDF(`• Vacas: ${resumo.value.vacas}`), marginLeft, y); y += 6;
      doc.text(limparTextoPDF(`• Vacas S/B: ${resumo.value.vacasSN}`), marginLeft, y); y += 6;
      doc.text(limparTextoPDF(`• Touros: ${resumo.value.touros}`), marginLeft, y); y += 6;
      doc.text(limparTextoPDF(`• Bezerros Machos: ${resumo.value.bezerrosMacho}`), marginLeft, y); y += 6;
      doc.text(limparTextoPDF(`• Bezerros Fêmeas: ${resumo.value.bezerrosFemea}`), marginLeft, y); y += 6;
      doc.text(limparTextoPDF(`• Bezerros Desmama: ${resumo.value.bezerrosDesmama}`), marginLeft, y); y += 6;

    
      y += 6;
    
      // 🔹 Resumo St. André (sem emoji)
      doc.setFontSize(13);
      doc.text(limparTextoPDF("Resumo St. Andre"), marginLeft, y);
      y += 8;
    
      doc.setFontSize(11);
      doc.text(limparTextoPDF(`• Vacas: ${resumoStAndre.value.vacas}`), marginLeft, y); y += 6;
      doc.text(limparTextoPDF(`• Bois: ${resumoStAndre.value.bois}`), marginLeft, y); y += 6;
    
      y += 6;
    
      // 🔹 Resumo Confinamento
      doc.setFontSize(13);
      doc.text(limparTextoPDF("Resumo Confinamento"), marginLeft, y);
      y += 8;
    
      doc.setFontSize(11);
      doc.text(limparTextoPDF(`• Fêmeas: ${resumoConfinamento.value.femeas}`), marginLeft, y); y += 6;
      doc.text(limparTextoPDF(`• Machos: ${resumoConfinamento.value.machos}`), marginLeft, y); y += 6;
      doc.text(limparTextoPDF(`• Total: ${totalAnimaisConfinamento.value}`), marginLeft, y); y += 10;
    
      // 🔹 Resumo Geral
      doc.setFontSize(13);
      doc.text(limparTextoPDF("Resumo Geral"), marginLeft, y);
      y += 8;
    
      doc.setFontSize(11);
      doc.text(
        limparTextoPDF(
          `• Total Geral: ${
            totalBovinos.value +
            totalAnimaisConfinamento.value +
            totalStAndre.value
          }`
        ),
        marginLeft,
        y
      );
    
      doc.save("Relatorio_Resumos.pdf");
    };


    // Últimos animais Pasto (mantido)
    const ultimosAnimais = computed(() => {
      return [...bovinos.value]
        .sort((a, b) => {
          const dataA = new Date(a.createdAt?.seconds * 1000 || 0)
          const dataB = new Date(b.createdAt?.seconds * 1000 || 0)
          return dataB - dataA
        })
        .slice(0, 5)
    })

    return {
      resumo,
      resumoConfinamento,
      resumoStAndre,
      totalBovinos,
      totalAnimais: totalAnimaisConfinamento,
      totalAnimaisConfinamento,
      totalStAndre,
      exportToPDFResumos,
      dataAtualFormatada,
      ultimosAnimais
    }
  }
}
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
