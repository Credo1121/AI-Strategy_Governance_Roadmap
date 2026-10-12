import { z } from 'zod';

export const focuses = ['hardware', 'software', 'sales'] as const;
export const audiences = ['c-level', 'c-1', 'c-2'] as const;
export const questionIds = ['ambition','constraint','change','evidence','ownership','funding'] as const;
export type AnswerId = `${typeof focuses[number]}.${typeof questionIds[number]}`;
export const answerIds = focuses.flatMap(f=>questionIds.map(q=>`${f}.${q}`)) as [AnswerId,...AnswerId[]];
export function answerKey(focus:typeof focuses[number],question:typeof questionIds[number]):AnswerId {return `${focus}.${question}`}
export const optionIds = ['engineering','software-loop','sales-intelligence','platform'] as const;
export const contextSchema = z.object({
  name: z.string().trim().min(2).max(100),
  profile: z.enum(['group','midmarket']),
  objective: z.string().trim().max(2000),
  audience: z.enum(audiences),
  focus: z.enum(focuses)
}).strict();
export const createSchema = contextSchema.pick({name:true,profile:true});
export const answersSchema = z.partialRecord(z.enum(answerIds), z.string().trim().max(4000));
export const updateSchema = z.object({revision:z.number().int().min(0),context:contextSchema,answers:answersSchema,selectedOptions:z.array(z.enum(optionIds)).max(4).refine(x=>new Set(x).size===x.length,'Doppelte Auswahl')}).strict();
export const engagementSchema = z.object({id:z.string().uuid(),revision:z.number().int().min(0),context:contextSchema,answers:answersSchema,selectedOptions:z.array(z.enum(optionIds)),updatedAt:z.string(),synthetic:z.literal(true)});
export type Engagement = z.infer<typeof engagementSchema>;
export type Update = z.infer<typeof updateSchema>;
export type Context = z.infer<typeof contextSchema>;
export type Focus = typeof focuses[number];
export type Audience = typeof audiences[number];
export const labels: Record<Focus,string> = {hardware:'Hardware-Entwicklung',software:'Software-Entwicklung',sales:'Vertrieb'};
export const audienceLabels: Record<Audience,string> = {'c-level':'C-Level','c-1':'C-1','c-2':'C-2'};
