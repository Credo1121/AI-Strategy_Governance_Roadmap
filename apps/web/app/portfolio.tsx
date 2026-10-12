'use client';

import { useState } from 'react';
import {
  boardStatusLabels,
  initiativeFocusLabels,
  type Engagement,
  type Initiative,
  type InitiativeFocus
} from '@strategy/shared';
import type { Catalog } from '@strategy/shared/catalog';

type Props = {
  engagement: Engagement;
  catalog: Catalog;
  onChange: (update: Partial<Engagement>) => void;
};

const money = new Intl.NumberFormat('de-DE',{maximumFractionDigits:1});
const optionFocus: Record<Engagement['selectedOptions'][number],InitiativeFocus> = {
  engineering:'hardware','software-loop':'software','sales-intelligence':'sales',platform:'shared'
};

export default function Portfolio({engagement,catalog,onChange}:Props){
  const [title,setTitle]=useState('');
  const [focus,setFocus]=useState<InitiativeFocus>('hardware');
  const initiatives=engagement.initiatives;
  const committed=initiatives.reduce((sum,item)=>sum+item.committed,0);
  const nextTranches=initiatives.reduce((sum,item)=>sum+item.nextTranche,0);
  const available=engagement.finance.budget-committed;
  const unadopted=engagement.selectedOptions.filter(optionId=>!initiatives.some(item=>item.optionId===optionId));

  function patchInitiative(id:string,patch:Partial<Initiative>){
    onChange({initiatives:initiatives.map(item=>item.id===id?{...item,...patch}:item)});
  }
  function adoptOptions(){
    const additions=unadopted.map(optionId=>{
      const option=catalog.options.find(item=>item.id===optionId)!;
      return {
        id:crypto.randomUUID(),title:option.name,origin:'option' as const,optionId,
        focus:optionFocus[optionId],owner:'',hypothesis:option.value,evidence:option.criteria,
        risk:option.risk,status:'candidate' as const,committed:0,nextTranche:0
      };
    });
    if(additions.length)onChange({initiatives:[...initiatives,...additions]});
  }
  function addManual(event:React.FormEvent){
    event.preventDefault();
    if(title.trim().length<2)return;
    onChange({initiatives:[...initiatives,{id:crypto.randomUUID(),title:title.trim(),origin:'manual',focus,owner:'',hypothesis:'',evidence:'',risk:'',status:'candidate',committed:0,nextTranche:0}]});
    setTitle('');
  }
  function finance<K extends keyof Engagement['finance']>(key:K,value:Engagement['finance'][K]){
    onChange({finance:{...engagement.finance,[key]:value}});
  }

  return <>
    <section className="portfolio-summary" aria-label="Portfolio-Finanzrahmen">
      <article><span>Jahrestarget</span><strong>{money.format(engagement.finance.target)}</strong><small>Tsd. EUR</small></article>
      <article><span>Genehmigtes Budget</span><strong>{money.format(engagement.finance.budget)}</strong><small>Tsd. EUR</small></article>
      <article><span>Rolling Forecast</span><strong>{money.format(engagement.finance.forecast)}</strong><small>Tsd. EUR</small></article>
      <article className={available<0?'metric-alert':''}><span>Nach Bindungen verfügbar</span><strong>{money.format(available)}</strong><small>Tsd. EUR</small></article>
    </section>

    <section className="panel finance-panel">
      <div className="section-heading"><div><span className="tiny">FINANZRAHMEN · ALLE BETRÄGE IN TSD. EUR</span><h2>Target, Forecast und Mittelbindung zusammenführen</h2><p>Der Forecast aktualisiert die Erwartung. Er erweitert nicht die Ausgabenbefugnis.</p></div><span className="badge">Geschäftsjahr {engagement.finance.fiscalYear}</span></div>
      <div className="finance-grid">
        <label>Geschäftsjahr<input type="number" min="2020" max="2100" value={engagement.finance.fiscalYear} onChange={event=>finance('fiscalYear',Number(event.target.value))}/></label>
        <label>Jahrestarget<input type="number" min="0" step="10" value={engagement.finance.target} onChange={event=>finance('target',Number(event.target.value))}/></label>
        <label>Genehmigtes Budget<input type="number" min="0" step="10" value={engagement.finance.budget} onChange={event=>finance('budget',Number(event.target.value))}/></label>
        <label>Rolling Forecast<input type="number" min="0" step="10" value={engagement.finance.forecast} onChange={event=>finance('forecast',Number(event.target.value))}/></label>
        <label>Ist-Kosten<input type="number" min="0" step="10" value={engagement.finance.actuals} onChange={event=>finance('actuals',Number(event.target.value))}/></label>
        <div className="derived-money"><span>Gebundene Mittel</span><strong>{money.format(committed)}</strong><small>aus {initiatives.length} Initiativen</small></div>
        <div className="derived-money"><span>Nächste Tranchen</span><strong>{money.format(nextTranches)}</strong><small>zur Board-Entscheidung</small></div>
      </div>
      <label className="full">Begründung für Umschichtung / Forecast-Abweichung<textarea rows={3} maxLength={1500} value={engagement.finance.reallocationNote} placeholder="Welche Evidenz, Verpflichtung oder Kapazitätsänderung begründet eine Umschichtung?" onChange={event=>finance('reallocationNote',event.target.value)}/></label>
      {(engagement.finance.forecast>engagement.finance.budget||available<0)&&<div className="portfolio-warning" role="status"><strong>Board-Klärung erforderlich</strong><span>{engagement.finance.forecast>engagement.finance.budget?'Der Forecast liegt oberhalb des genehmigten Budgets. ':''}{available<0?'Die gebundenen Mittel überschreiten den Budgetrahmen. ':''}Abweichung, Entscheidungsrecht und Gegenmaßnahme dokumentieren.</span></div>}
    </section>

    <section className="board-strip">
      <div><span className="tiny">PORTFOLIO BOARD</span><h2>Vier Perspektiven vor der nächsten Tranche</h2><p>{catalog.portfolioBoard.cadence}</p></div>
      <div className="board-perspectives">{catalog.portfolioBoard.perspectives.map(item=><article key={item.name}><strong>{item.name}</strong><span>{item.question}</span></article>)}</div>
      <small>{catalog.portfolioBoard.limit}</small>
    </section>

    <div className="portfolio-actions">
      <div><span className="tiny">INITIATIVEN</span><h2>Von der Strategieoption zur Board-Entscheidung</h2><p>{initiatives.length} Initiativen · {unadopted.length} ausgewählte Optionen noch nicht übernommen</p></div>
      <button className="button primary" type="button" onClick={adoptOptions} disabled={!unadopted.length}>Aus Optionen übernehmen ({unadopted.length})</button>
    </div>

    <form className="manual-initiative" onSubmit={addManual}>
      <label>Zusätzliche Initiative<input required minLength={2} maxLength={120} value={title} placeholder="z. B. AI-gestützte Service-Triage" onChange={event=>setTitle(event.target.value)}/></label>
      <label>Wertfeld<select value={focus} onChange={event=>setFocus(event.target.value as InitiativeFocus)}>{Object.entries(initiativeFocusLabels).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
      <button className="button outline" type="submit">Manuell anlegen</button>
    </form>

    {!initiatives.length?<div className="empty"><h2>Noch keine Portfolioinitiative</h2><p>Ausgewählte Strategieoptionen übernehmen oder eine zusätzliche Initiative manuell anlegen.</p></div>:<div className="initiative-list">{initiatives.map((item,index)=><article className="panel initiative-card" key={item.id}>
      <div className="initiative-head"><div><span className="tiny">INITIATIVE {String(index+1).padStart(2,'0')} · {item.origin==='option'?'AUS STRATEGIEOPTION':'MANUELL'}</span><input aria-label={`Titel Initiative ${index+1}`} className="initiative-title" maxLength={120} value={item.title} onChange={event=>patchInitiative(item.id,{title:event.target.value})}/></div><span className={`decision-pill status-${item.status}`}>{boardStatusLabels[item.status]}</span></div>
      <div className="initiative-controls">
        <label>Wertfeld<select aria-label={`Wertfeld Initiative ${index+1}`} value={item.focus} onChange={event=>patchInitiative(item.id,{focus:event.target.value as InitiativeFocus})}>{Object.entries(initiativeFocusLabels).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
        <label>Benefit Owner<input aria-label={`Benefit Owner Initiative ${index+1}`} maxLength={100} value={item.owner} placeholder="Noch offen" onChange={event=>patchInitiative(item.id,{owner:event.target.value})}/></label>
        <label>Board-Status<select aria-label={`Board-Status Initiative ${index+1}`} value={item.status} onChange={event=>patchInitiative(item.id,{status:event.target.value as Initiative['status']})}>{Object.entries(boardStatusLabels).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
        <label>Gebundene Mittel<input aria-label={`Gebundene Mittel Initiative ${index+1}`} type="number" min="0" step="10" value={item.committed} onChange={event=>patchInitiative(item.id,{committed:Number(event.target.value)})}/></label>
        <label>Nächste Tranche<input aria-label={`Nächste Tranche Initiative ${index+1}`} type="number" min="0" step="10" value={item.nextTranche} onChange={event=>patchInitiative(item.id,{nextTranche:Number(event.target.value)})}/></label>
      </div>
      <div className="initiative-texts">
        <label>Wirkungshypothese<textarea rows={3} maxLength={1200} value={item.hypothesis} placeholder="Welcher Wert soll wodurch entstehen?" onChange={event=>patchInitiative(item.id,{hypothesis:event.target.value})}/></label>
        <label>Evidenz vor nächster Entscheidung<textarea rows={3} maxLength={1200} value={item.evidence} placeholder="Welche Baseline und welcher Nachweis rechtfertigen die nächste Tranche?" onChange={event=>patchInitiative(item.id,{evidence:event.target.value})}/></label>
        <label>Risiko und Kontrollbedarf<textarea rows={3} maxLength={1200} value={item.risk} placeholder="Was muss vor der nächsten Entscheidung geklärt werden?" onChange={event=>patchInitiative(item.id,{risk:event.target.value})}/></label>
      </div>
    </article>)}</div>}
    <div className="note">Keine automatische Priorisierung oder Freigabe. Target, Forecast und Portfoliozahlen sind synthetische Gesprächsdaten; verbindliche Entscheidungsrechte und Freigabegrenzen sind kundenspezifisch festzulegen.</div>
  </>;
}
