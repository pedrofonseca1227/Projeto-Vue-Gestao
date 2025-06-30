<template>
  <div class="container mt-5 relatorio-page">
    <h2 class="text-center titulo-relatorio">📄 Relatório Fazenda Santa Esméria</h2>

    <!-- LOCALIZAÇÃO -->
    <div class="bloco">
      <h4 class="titulo-secao">📍 1. Localização</h4>
      <p><strong>Município:</strong> Lupércio, São Paulo</p>
      <p><strong>Rodovia:</strong> S.P. 331 – Km 9 – Bairro Sta Terezinha</p>
      <p><strong>Municípios próximos e distâncias:</strong></p>
      <ul>
        <li>1 – Lupércio – 6Km</li>
        <li>2 – Alvinlândia – 11Km</li>
        <li>3 – Bairro Santa Tereza – 0,3Km</li>
        <li>4 – Ubirajara – 35Km</li>
        <li>5 – Garça – 35Km</li>
        <li>6 – Marília – 28Km</li>
      </ul>
      <p><strong>Latitude:</strong> 22° 25’ 27” S</p>
      <p><strong>Longitude:</strong> 49° 52’ 12” W</p>
    </div>

    <!-- ASPECTOS -->
    <div class="bloco">
      <h4 class="titulo-secao">🌱 2. Aspectos Físicos e Ocupação</h4>
      <ul>
        <li><strong>Área Total:</strong> 3.766,66 Hás ou 1.569,44 Alqs.</li>
        <li><strong>CITRUS:</strong> 407,23 Hás – 245.000 plantas</li>
        <li><strong>CAFÉ:</strong> 626 Hás – 1.280.000 plantas</li>
        <li><strong>SERINGUEIRA:</strong> 272,54 Hás – 112.478 plantas</li>
        <li><strong>REFLORESTAMENTO:</strong> 57,80 Hás – 138.000 plantas</li>
        <li><strong>PASTAGENS:</strong> 680 Hás (Tipo Brachiaria)</li>
        <li><strong>MILHO:</strong> 500 Hás</li>
        <li><strong>RESERVAS NATURAIS:</strong> 971,47 Hás</li>
      </ul>
    </div>

    <!-- BENFEITORIAS -->
    <div class="bloco">
      <h4 class="titulo-secao">🏠 3. Benfeitorias e Prédios</h4>
      <ul class="colunas-duplas">
        <li>Casa de Sede</li>
        <li>Casa de Administração</li>
        <li>06 Casas de Apoio Administração</li>
        <li>70 Casas de Colônia (75 m²)</li>
        <li>Barracão Oficina (438 m²)</li>
        <li>Barracão Hidráulica (30,72 m²)</li>
        <li>Cobertura p/ Máquinas (584 m²)</li>
        <li>Barracão Almoxarifado (403 m²)</li>
        <li>Alojamento (54 m²)</li>
        <li>Máquinas de Benefício de Café (238,72 m²)</li>
        <li>Conjunto de Tulhas (385,24 m²)</li>
        <li>Barracão Carpintaria (135,00 m²)</li>
        <li>Depósito Cernambi (631 m²)</li>
        <li>Depósito Seringueira (54 m²)</li>
        <li>Escola/Treinamento (381,79 m²)</li>
        <li>Hangar (162,88 m²)</li>
        <li>Campo de Aviação (750m)</li>
        <li>Packing House (631,07 m²)</li>
        <li>2 Terreiros Café (8.270 m²)</li>
        <li>Cabine de Alta Tensão (190 m²)</li>
        <li>Escritório (103 m² / 3 divisões)</li>
        <li>Mangueira p/ Gado (1.798 m²)</li>
        <li>Área Viveiro (500.000 mudas de café)</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RelatorioPage'
}
</script>

<style scoped>
.relatorio-page {
  font-family: 'Segoe UI', sans-serif;
  color: #333;
}

.titulo-relatorio {
  font-size: 2rem;
  color: #205C40;
  border-bottom: 2px solid #ccc;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

.bloco {
  background-color: #f8f9fa;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.titulo-secao {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2e6a4f;
}

ul {
  padding-left: 1rem;
  margin-bottom: 0;
}

ul li {
  margin-bottom: 0.4rem;
}

.colunas-duplas {
  columns: 2;
  column-gap: 2rem;
}

@media (max-width: 768px) {
  .colunas-duplas {
    columns: 1;
  }
}
</style>
