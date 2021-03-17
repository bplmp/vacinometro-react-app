import './App.css';
// import updatedAt from "./components/data/updated_at"
import projections from "./components/data/projections"
import milestones from "./components/data/milestones"
import latest from "./components/data/latest"
import ChartPctVaccinated from "./components/ChartPctVaccinated"
import ChartDosesGiven from "./components/ChartDosesGiven"
// import ChartPctVaccinatedByState from "./components/ChartPctVaccinatedByState"
import ChartDosesGivenByState from "./components/ChartDosesGivenByState"

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
  // const br = projections['WRL']
  // const brProj = br.filter(row => row.projected === true)
  // const brMainMilestone = brProj.filter(row => row.milestone === MAIN_MILESTONE)[0]
  const brMainMilestone = milestones.filter(row => row.milestone === 0.9 && row.code === "WRL")[0]
  const brMainMilestoneDate = new Date(brMainMilestone.date + " 00:00:00").toLocaleString("pt-PT", {year: "numeric", month: "2-digit", day: "2-digit"})
  const brLatest = latest.filter(row => row.code === "WRL")[0]

  const oneDay = 24 * 60 * 60 * 1000
  const daysUntilYearEnd = Math.round(Math.abs((new Date() - new Date(`${(new Date().getFullYear() + 1).toString()}-01-01`)) / oneDay))
  const daysUntilBrMilestone = brMainMilestone.days_until
  const timesDosesUntilYearEnd = daysUntilBrMilestone > daysUntilYearEnd ? daysUntilBrMilestone / daysUntilYearEnd : false

  return (
    <div className="grid">
      <section>
        <p className="f6 i mt4 tc">Dados atualizados em {new Date(brLatest.date + " 00:00:00").toLocaleString("pt-PT", {year: "numeric", month: "2-digit", day: "2-digit"})}</p>
        <h1 className="tc f2-ns f3 lh-copy b mb3">Quanto tempo até a população brasileira ser vacinada contra o Covid-19?</h1>
        <p className="tc f3-ns f4 lh-copy normal mt0">No ritmo atual, demoraria até <span className="b">{brMainMilestoneDate}</span> para que <span className="b">{MAIN_MILESTONE * 100}%</span> da população adulta do Brasil recebesse <span className="b">pelo menos 1 dose</span> da vacina.</p>
        <ChartPctVaccinated rawData={projections} stateCode="WRL"/>
        {timesDosesUntilYearEnd &&
          <p className="tc f3-ns f4 lh-copy normal mt4">Precisamos vacinar <span className="b">{timesDosesUntilYearEnd.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} vezes mais rápido</span> para que 90% da população receba pelo menos uma dose <span className="b">até o fim do ano</span>.</p>
        }
      </section>
      <section>
        <h2 className="tc f2-ns f3 lh-copy b">Quantas primeiras doses estão sendo aplicadas por dia no Brasil?</h2>
        <p className="tc f3-ns f4 lh-copy normal mt0">O Brasil está aplicando <span className="b">{brLatest.new_first_shot_mov_avg.toLocaleString("pt-BR")} primeiras doses por dia</span>, considerando a média móvel dos últimos {MOVING_AVG} dias.</p>
        <ChartDosesGiven rawData={projections} stateCode="WRL"/>
        <figcaption className="f6 i mt2">A linha representa a média movel de {MOVING_AVG} dias.</figcaption>
      </section>
      <section className="mt4 bt">
        <h2 className="tc f2-ns f3 lh-copy b mb0">Como está o ritmo da vacinação em cada estado?</h2>
        <h3 className="tc f4-ns f5 lh-copy normal mb0 mt4">Primeiras doses aplicadas em média por dia, por estado</h3>
        <ChartDosesGivenByState rawData={latest}/>
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
        <p className="lh-copy">Desenvolvido por <a href="https://bernardol.com">Bernardo Loureiro</a> | <a href="https://medidasp.com">Medida SP</a>.</p>
      </section>
    </div>
  );
}

export default App;
