import './App.css';
// import updatedAt from "./components/data/updated_at"
import projections_first from "./components/data/coverage_first_shot/projections"
import milestones_first from "./components/data/coverage_first_shot/milestones"
import latest_first from "./components/data/coverage_first_shot/latest"

import projections_full from "./components/data/coverage_fully_vaccinated/projections"
import milestones_full from "./components/data/coverage_fully_vaccinated/milestones"
import latest_full from "./components/data/coverage_fully_vaccinated/latest"

import ChartPctVaccinated from "./components/ChartPctVaccinated"
import ChartDosesGiven from "./components/ChartDosesGiven"
// import ChartPctVaccinatedByState from "./components/ChartPctVaccinatedByState"
import ChartDosesGivenByState from "./components/ChartDosesGivenByState"
import moment from "moment"

const MOVING_AVG = 7
const MAIN_MILESTONE = 0.9
const STATES = [
  {'name': 'Acre', 'acronym': 'AC'},
  {'name': 'Alagoas', 'acronym': 'AL'},
  {'name': 'Amapá', 'acronym': 'AP'},
  {'name': 'Amazonas', 'acronym': 'AM'},
  {'name': 'Bahia', 'acronym': 'BA'},
  {'name': 'Ceará', 'acronym': 'CE'},
  {'name': 'Distrito Federal', 'acronym': 'DF'},
  {'name': 'Espírito Santo', 'acronym': 'ES'},
  {'name': 'Goiás', 'acronym': 'GO'},
  {'name': 'Maranhão', 'acronym': 'MA'},
  {'name': 'Mato Grosso', 'acronym': 'MT'},
  {'name': 'Mato Grosso do Sul', 'acronym': 'MS'},
  {'name': 'Minas Gerais', 'acronym': 'MG'},
  {'name': 'Pará', 'acronym': 'PA'},
  {'name': 'Paraíba', 'acronym': 'PB'},
  {'name': 'Paraná', 'acronym': 'PR'},
  {'name': 'Pernambuco', 'acronym': 'PE'},
  {'name': 'Piauí', 'acronym': 'PI'},
  {'name': 'Rio de Janeiro', 'acronym': 'RJ'},
  {'name': 'Rio Grande do Norte', 'acronym': 'RN'},
  {'name': 'Rio Grande do Sul', 'acronym': 'RS'},
  {'name': 'Rondônia', 'acronym': 'RO'},
  {'name': 'Roraima', 'acronym': 'RR'},
  {'name': 'Santa Catarina', 'acronym': 'SC'},
  {'name': 'São Paulo', 'acronym': 'SP'},
  {'name': 'Sergipe', 'acronym': 'SE'},
  {'name': 'Tocantins', 'acronym': 'TO'},
]

const DATA_SOURCE = {
  "text": "Consórcio formado pelos veículos Folha, UOL, O Estado de S. Paulo, Extra, O Globo e G1",
   "url": "https://arte.folha.uol.com.br/ciencia/2021/veja-como-esta-a-vacinacao/brasil/"
}

function App() {
  const brLatest = latest_first.filter(row => row.code === "WRL")[0]

  const brMainMilestoneFirst = milestones_first.filter(row => row.milestone === 0.9 && row.code === "WRL")[0]
  const brMainMilestoneDateFirst = moment(brMainMilestoneFirst.date).format('DD/MM/YYYY')
  const brMainMilestoneFull = milestones_full.filter(row => row.milestone === 0.9 && row.code === "WRL")[0]
  const brMainMilestoneDateFull = moment(brMainMilestoneFull.date).format('DD/MM/YYYY')

  const oneDay = 24 * 60 * 60 * 1000
  const daysUntilYearEnd = Math.round(Math.abs((new Date() - new Date(`${(new Date().getFullYear() + 1).toString()}-01-01`)) / oneDay))

  const daysUntilBrMilestoneFirst = brMainMilestoneFirst.days_until
  const timesDosesUntilYearEndFirst = daysUntilBrMilestoneFirst > daysUntilYearEnd ? daysUntilBrMilestoneFirst / daysUntilYearEnd : false
  const daysUntilBrMilestoneFull = brMainMilestoneFull.days_until
  const timesDosesUntilYearEndFull = daysUntilBrMilestoneFull > daysUntilYearEnd ? daysUntilBrMilestoneFull / daysUntilYearEnd : false

  return (
    <div className="grid">
      <section>
        <p className="f6 i mt4 tc">Dados atualizados em {moment(brLatest.date).format('DD/MM/YYYY')}</p>
        <h1 className="tc f2-ns f3 lh-copy b mb3">Quanto tempo até a população brasileira ser vacinada contra a Covid-19?</h1>

        <h2 className="tc f2-ns f3 bb pb2 mt4">Primeira dose</h2>
        <p className="tc f4-ns f5 lh-copy normal mt0">No ritmo atual, demoraria até <span className="b">{brMainMilestoneDateFirst}</span> para que <span className="b">{MAIN_MILESTONE * 100}%</span> da população adulta do Brasil recebesse <span className="b">pelo menos 1 dose</span> da vacina.</p>
        <ChartPctVaccinated rawData={projections_first} stateCode="WRL" coverageCol="coverage_first_shot"/>
        {timesDosesUntilYearEndFirst &&
          <p className="tc f3-ns f4 lh-copy normal mt4">Precisamos vacinar <span className="b">{timesDosesUntilYearEndFirst.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} vezes mais rápido</span> para que 90% da população receba pelo menos uma dose <span className="b">até o fim do ano</span>.</p>
        }

        <h2 className="tc f2-ns f3 bb pb2 mt4">Imunização completa</h2>
        <p className="tc f4-ns f5 lh-copy normal mt0">No ritmo atual, demoraria até <span className="b">{brMainMilestoneDateFull}</span> para que <span className="b">{MAIN_MILESTONE * 100}%</span> da população adulta do Brasil recebesse <span className="b">imunização completa</span> (duas doses ou dose única).</p>
        <ChartPctVaccinated rawData={projections_full} stateCode="WRL" coverageCol="coverage_fully_vaccinated"/>
        {timesDosesUntilYearEndFull &&
          <p className="tc f3-ns f4 lh-copy normal mt4">Precisamos vacinar <span className="b">{timesDosesUntilYearEndFull.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} vezes mais rápido</span> para que 90% da população receba imunização completa <span className="b">até o fim do ano</span>.</p>
        }
      </section>
      <section>
        <h2 className="tc f2-ns f3 lh-copy b">Quantas primeiras doses estão sendo aplicadas por dia no Brasil?</h2>
        <p className="tc f3-ns f4 lh-copy normal mt0">O Brasil está aplicando <span className="b">{brLatest.new_first_shot_mov_avg.toLocaleString("pt-BR")} primeiras doses por dia</span>, considerando a média móvel dos últimos {MOVING_AVG} dias.</p>
        <ChartDosesGiven rawData={projections_first} stateCode="WRL" shotColMa="new_first_shot_mov_avg" shotCol="new_first_shot"/>
        <figcaption className="f6 i mt2">A linha representa a média movel de {MOVING_AVG} dias.</figcaption>
      </section>
      <section>
        <h2 className="tc f2-ns f3 lh-copy b">Quantas segundas doses (ou doses únicas) estão sendo aplicadas por dia no Brasil?</h2>
        <p className="tc f3-ns f4 lh-copy normal mt0">O Brasil está aplicando <span className="b">{brLatest.new_fully_vaccinated_mov_avg.toLocaleString("pt-BR")} segundas doses por dia</span>, considerando a média móvel dos últimos {MOVING_AVG} dias.</p>
        <ChartDosesGiven rawData={projections_full} stateCode="WRL" shotColMa="new_fully_vaccinated_mov_avg" shotCol="new_fully_vaccinated"/>
        <figcaption className="f6 i mt2">A linha representa a média movel de {MOVING_AVG} dias.</figcaption>
      </section>
      <section className="mt4 bt">
        <h2 className="tc f2-ns f3 lh-copy b mb0">Como está o ritmo da vacinação em cada estado?</h2>
        <h3 className="tc f4-ns f5 lh-copy normal mb0 mt4">Primeiras doses aplicadas em média por dia, por estado</h3>
        <ChartDosesGivenByState rawData={latest_first} shotColMa="new_first_shot_mov_avg"/>
        <figcaption className="f6 i mt2">Dado representa a média movel de {MOVING_AVG} dias.</figcaption>
        <h3 className="tc f4-ns f5 lh-copy normal mb0 mt4">Segundas doses aplicadas em média por dia, por estado</h3>
        <ChartDosesGivenByState rawData={latest_full} shotColMa="new_fully_vaccinated_mov_avg"/>
        <figcaption className="f6 i mt2">Dado representa a média movel de {MOVING_AVG} dias.</figcaption>
        {/*
        <h3 className="tc f4-ns f5 lh-copy normal mb0 mt4">Dias até 90% da população receber a primeira dose, por estado</h3>
        <ChartPctVaccinatedByState rawData={milestones}/>
        <figcaption className="f6 i mt2">Projeção considera a média movel de {MOVING_AVG} dias de primeiras doses e população adulta por estado.</figcaption>
        */}
      </section>
        {/*
        <section className="mt5 bt">
        <h2 className="tc f2-ns f3 lh-copy b mb0">Veja os gráficos para cada estado</h2>
        {
          STATES.map(state => (
          <section key={state.acronym}>
            <h2 className="tc f3-ns f4 lh-copy b mt5">{state.name}</h2>
            <div className="">
              <div className="w-100">
                <ChartPctVaccinated rawData={projections} stateCode={state.acronym}/>
              </div>
              <div className="w-100">
                <ChartDosesGiven rawData={projections} stateCode={state.acronym}/>
              </div>
            </div>
          </section>
        ))
        }
        </section>
        */}
      <section className="mt4 bt">
        <h2 className="tc f2-ns f3 lh-copy b mb0">Dados e metodologia</h2>
        <p className="lh-copy">Os dados de vacinação são do <a href={DATA_SOURCE.url} target="_blank" rel="noreferrer">{DATA_SOURCE.text}</a>. Dados de população são estimativas do IBGE, 2020.</p>
        <p className="lh-copy">Consideramos população adulta (elegível para receber a vacina) como os maiores de 18 anos.</p>
        <p className="lh-copy">A projeção do tempo para vacinar a população adulta com pelo menos uma dose considera a média móvel de {MOVING_AVG} dias das novas primeiras doses aplicadas.</p>
        <p className="lh-copy">Inspirado no painel de vacinação do <a href="https://www.nytimes.com/interactive/2020/us/covid-19-vaccine-doses.html">NY Times</a>.</p>
        <p className="lh-copy">Desenvolvido por <a href="https://twitter.com/bernardomaps">Bernardo Loureiro | Medida SP</a>.</p>
      </section>
    </div>
  );
}

export default App;
