<template>
  <div class="container mt-5">
    <h2 class="text-center fw-bold mb-2">🐄 Bovinos no Pasto</h2>
    <p class="text-center text-muted mb-4">Controle detalhado e visual do rebanho atual no pasto</p>

    <!-- Ações -->
    <div class="row justify-content-between mb-3">
      <div class="col-md-6">
        <input
          v-model="filtro.nome"
          type="text"
          class="form-control"
          placeholder="🔍 Buscar por nome ou identificação"
        />
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-outline-danger me-2" @click="exportToPDF">
          🧾 Exportar PDF
        </button>
        <router-link to="/add-pasto" class="btn btn-success">
          ➕ Adicionar Animal
        </router-link>
      </div>
    </div>

    <!-- Contagem -->
    <div class="row g-3 text-center mb-4">
      <div class="col-6 col-md-4 col-lg-2" v-for="(valor, chave) in resumoContagem" :key="chave">
        <div class="card shadow-sm rounded">
          <div class="card-body p-2">
            <h6 class="mb-1 text-muted text-uppercase" style="font-size: 0.75rem">{{ chave }}</h6>
            <h5 class="fw-bold">{{ valor }}</h5>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4 col-lg-2">
        <div class="card bg-primary text-white shadow-sm rounded">
          <div class="card-body p-2">
            <h6 class="mb-1 text-uppercase" style="font-size: 0.75rem">Total</h6>
            <h5 class="fw-bold">{{ totalBovinos }}</h5>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered table-striped align-middle">
            <thead class="table-dark">
              <tr>
                <th>Identificação</th>
                <th>Raça</th>
                <th>Sexo</th>
                <th>Localização</th>
                <th>Origem</th>
                <th>Vacinação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="bovinosFiltrados.length === 0">
                <td colspan="6" class="text-center text-muted">Nenhum bovino encontrado</td>
              </tr>
              <tr v-for="(bovino, index) in bovinosFiltrados" :key="index">
                <td>{{ bovino.nome }}</td>
                <td>{{ bovino.raca }}</td>
                <td>
                  <span :class="sexoBadgeClass(bovino.sexo)">
                    {{ bovino.sexo }}
                  </span>
                </td>
                <td>{{ bovino.localizacao }}</td>
                <td>{{ bovino.origem }}</td>
                <td>{{ bovino.vacinacao }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import jsPDF from 'jspdf'
import logoImage from '../assets/LogoPdf.jpg'

export default {
  setup() {
    const bovinos = ref([])
    const filtro = ref({ nome: '' })

    onMounted(() => {
      const q = query(collection(db, 'GadoPasto'), orderBy('nome'))
      onSnapshot(q, (snapshot) => {
        bovinos.value = snapshot.docs.map(doc => doc.data())
      })
    })

    const bovinosFiltrados = computed(() =>
      bovinos.value.filter((b) =>
        b.nome?.toLowerCase().includes(filtro.value.nome.toLowerCase())
      )
    )

    const resumoContagem = computed(() => {
      let vacas = 0,
        vacasSN = 0,
        touros = 0,
        bezerrosMacho = 0,
        bezerrosFemea = 0,
        bezerrosDesmama = 0

      bovinos.value.forEach((b) => {
        const nome = b.nome?.toLowerCase() || ''
        const sexo = b.sexo?.trim().toLowerCase()

        if (nome.includes('vaca') && !nome.includes('s/n')) vacas++
        else if (nome.includes('vaca') && nome.includes('s/n')) vacasSN++
        else if (nome.includes('touro')) touros++
        else if (nome.includes('bezerro') && sexo === 'fêmea') bezerrosFemea++

        if (nome.includes('bezerro') && sexo === 'macho') {
          if (nome.includes('desmama')) bezerrosDesmama++
          else bezerrosMacho++
        }
      })

      return {
        Vacas: vacas,
        'Vacas S/N': vacasSN,
        Touros: touros,
        'Bezerros Macho': bezerrosMacho,
        'Bezerros Fêmea': bezerrosFemea,
        'Bezerros Desmama': bezerrosDesmama
      }
    })

    const totalBovinos = computed(() => bovinos.value.length)

    const sexoBadgeClass = (sexo) => {
      const s = sexo?.toLowerCase()
      if (s === 'macho') return 'badge bg-primary'
      if (s === 'fêmea' || s === 'femea') return 'badge bg-warning text-dark'
      return 'badge bg-secondary'
    }

    const exportToPDF = () => {
      const doc = new jsPDF()
      const marginLeft = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const centerX = pageWidth / 2

      const img = new Image()
      img.src = logoImage

      doc.addImage(img, 'JPEG', marginLeft, 10, 30, 30)
      doc.setFontSize(20)
      doc.setTextColor(33, 37, 41)
      doc.text('Relatório de Contagem de Bovinos Pasto', centerX, 45, { align: 'center' })

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text('Este relatório apresenta o resumo da contagem de bovinos...', marginLeft, 60, { maxWidth: 170 })

      doc.setLineWidth(0.5)
      doc.line(marginLeft, 70, pageWidth - marginLeft, 70)

      let y = 80
      doc.setFontSize(14)
      doc.setTextColor(33, 37, 41)
      doc.text('Resumo de Contagem de Bovinos', marginLeft, y)
      y += 10

      const resumo = resumoContagem.value
      for (const chave in resumo) {
        doc.text(`• ${chave}: ${resumo[chave]}`, marginLeft, y)
        y += 10
      }
      doc.text(`• Total: ${totalBovinos.value}`, marginLeft, y)
      doc.save('Resumo_GadoPasto.pdf')
    }

    return {
      bovinos,
      filtro,
      bovinosFiltrados,
      resumoContagem,
      totalBovinos,
      exportToPDF,
      sexoBadgeClass
    }
  }
}
</script>

<style scoped>
.table th, .table td {
  text-align: center;
  vertical-align: middle;
}
.card-body {
  padding: 24px;
}
.card {
  border-radius: 12px;
}
.badge {
  font-size: 0.75rem;
  padding: 0.4em 0.6em;
}
</style>
