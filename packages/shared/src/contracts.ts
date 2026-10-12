import { z } from 'zod';

export const focuses = ['hardware', 'software', 'sales'] as const;
export const audiences = ['c-level', 'c-1', 'c-2'] as const;
export const questionIds = ['ambition','constraint','change','evidence','ownership','funding'] as const;
export type AnswerId = `${typeof focuses[number]}.${typeof questionIds[number]}`;
export const answerIds = focuses.flatMap(f=>questionIds.map(q=>`${f}.${q}`)) as [AnswerId,...AnswerId[]];
export function answerKey(focus:typeof focuses[number],question:typeof questionIds[number]):AnswerId {return `${focus}.${question}`}
export const optionIds = ['engineering','software-loop','sales-intelligence','platform'] as const;
export const initiativeFocuses = ['hardware','software','sales','shared'] as const;
export const boardStatuses = ['candidate','validate','funded','scale','hold','stop'] as const;
const moneySchema = z.number().finite().min(0).max(1_000_000_000);
export const initiativeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(2).max(120),
  origin: z.enum(['manual','option']),
  optionId: z.enum(optionIds).optional(),
  focus: z.enum(initiativeFocuses),
  owner: z.string().trim().max(100),
  hypothesis: z.string().trim().max(1200),
  evidence: z.string().trim().max(1200),
  risk: z.string().trim().max(1200),
  status: z.enum(boardStatuses),
  committed: moneySchema,
  nextTranche: moneySchema
}).strict().superRefine((value,ctx)=>{
  if(value.origin==='option'&&!value.optionId)ctx.addIssue({code:'custom',path:['optionId'],message:'Eine abgeleitete Initiative benötigt eine Strategieoption.'});
  if(value.origin==='manual'&&value.optionId)ctx.addIssue({code:'custom',path:['optionId'],message:'Eine manuelle Initiative darf keine Strategieoption vortäuschen.'});
});
export const financeSchema = z.object({
  fiscalYear: z.number().int().min(2020).max(2100),
  currency: z.literal('EUR'),
  target: moneySchema,
  budget: moneySchema,
  forecast: moneySchema,
  actuals: moneySchema,
  reallocationNote: z.string().trim().max(1500)
}).strict();
export const emptyFinance: z.infer<typeof financeSchema> = {fiscalYear:2027,currency:'EUR',target:0,budget:0,forecast:0,actuals:0,reallocationNote:''};
export const contextSchema = z.object({
  name: z.string().trim().min(2).max(100),
  profile: z.enum(['group','midmarket']),
  objective: z.string().trim().max(2000),
  audience: z.enum(audiences),
  focus: z.enum(focuses)
}).strict();
export const createSchema = contextSchema.pick({name:true,profile:true});
export const answersSchema = z.partialRecord(z.enum(answerIds), z.string().trim().max(4000));
const initiativesSchema = z.array(initiativeSchema).max(100).refine(items=>new Set(items.map(item=>item.id)).size===items.length,'Doppelte Initiativen').refine(items=>{
  const optionIds=items.filter(item=>item.origin==='option').map(item=>item.optionId);
  return new Set(optionIds).size===optionIds.length;
},'Eine Strategieoption darf nur einmal übernommen werden.');
export const updateSchema = z.object({revision:z.number().int().min(0),context:contextSchema,answers:answersSchema,selectedOptions:z.array(z.enum(optionIds)).max(4).refine(x=>new Set(x).size===x.length,'Doppelte Auswahl'),initiatives:initiativesSchema,finance:financeSchema}).strict();
export const engagementSchema = z.object({id:z.string().uuid(),revision:z.number().int().min(0),context:contextSchema,answers:answersSchema,selectedOptions:z.array(z.enum(optionIds)),initiatives:initiativesSchema.default([]),finance:financeSchema.default(emptyFinance),updatedAt:z.string(),synthetic:z.literal(true)});
export type Engagement = z.infer<typeof engagementSchema>;
export type Update = z.infer<typeof updateSchema>;
export type Context = z.infer<typeof contextSchema>;
export type Initiative = z.infer<typeof initiativeSchema>;
export type Finance = z.infer<typeof financeSchema>;
export type BoardStatus = typeof boardStatuses[number];
export type InitiativeFocus = typeof initiativeFocuses[number];
export type Focus = typeof focuses[number];
export type Audience = typeof audiences[number];
export const labels: Record<Focus,string> = {hardware:'Hardware-Entwicklung',software:'Software-Entwicklung',sales:'Vertrieb'};
export const audienceLabels: Record<Audience,string> = {'c-level':'C-Level','c-1':'C-1','c-2':'C-2'};
export const boardStatusLabels: Record<BoardStatus,string> = {candidate:'Kandidat',validate:'Evidenz prüfen',funded:'Tranche freigegeben',scale:'Skalierung prüfen',hold:'Halten',stop:'Stoppen'};
export const initiativeFocusLabels: Record<InitiativeFocus,string> = {...labels,shared:'Übergreifend'};
