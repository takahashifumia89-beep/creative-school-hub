import type {Text3,Question} from './curriculum';
export type LessonSource={title:string;url:string;publisher:string};
export type LessonMaterial={objectives:Text3[];sections:{title:Text3;paragraphs:Text3[]}[];workedExample:{brief:Text3;steps:Text3[];result:Text3};practice:{brief:Text3;steps:Text3[];deliverables:Text3[]};checklist:Text3[];sources:LessonSource[];questions:Question[];minutes:number};
