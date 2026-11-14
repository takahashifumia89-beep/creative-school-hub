import {z} from 'zod';
const text3=z.tuple([z.string().max(10000),z.string().max(10000),z.string().max(10000)]);
export const feedbackSchema=z.object({feedback:z.array(z.object({correct:z.boolean(),answer:z.number().int().min(0).max(20),explanation:text3})).max(20)});
export type QuestionFeedback=z.infer<typeof feedbackSchema>['feedback'][number];
export type SubmissionResult={kind:'passed'|'queued'|'failed';feedback?:QuestionFeedback[];error?:string};
export function shuffleIndexes(length:number,random=()=>Math.random()) {const result=Array.from({length},(_,i)=>i);for(let i=length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
