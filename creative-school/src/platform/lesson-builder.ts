import type {Text3,Question} from './curriculum';
import type {LessonMaterial,LessonSource} from './lesson-types';
export const T=(ru:string,en:string,kk:string):Text3=>[ru,en,kk];
export const Q=(q:Text3,options:Text3[],answer:number,explanation:Text3):Question=>({q,options,answer,explanation});
export type LessonInput={goal:Text3;principle:Text3;method:Text3;example:Text3;steps:Text3[];result:Text3;practice:Text3;actions:Text3[];deliverable:Text3;checks:Text3[];questions:Question[];sources:LessonSource[];minutes:number};
export function M(d:LessonInput):LessonMaterial{return {objectives:[d.goal,...d.checks.slice(0,1)],sections:[{title:T('Принцип и применение','Principle and application','Қағида және қолдану'),paragraphs:[d.principle]},{title:T('Рабочий процесс','Working method','Жұмыс тәсілі'),paragraphs:[d.method]}],workedExample:{brief:d.example,steps:d.steps,result:d.result},practice:{brief:d.practice,steps:d.actions,deliverables:[d.deliverable]},checklist:d.checks,sources:d.sources,questions:d.questions,minutes:d.minutes};}
export const sources={
 hierarchy:{title:'Visual Hierarchy in UX: Definition',url:'https://www.nngroup.com/articles/visual-hierarchy-ux-definition/',publisher:'Nielsen Norman Group'},
 spacing:{title:'Spacing units',url:'https://designsystem.digital.gov/design-tokens/spacing-units/',publisher:'U.S. Web Design System'},
 type:{title:'Using type',url:'https://designsystem.digital.gov/design-tokens/typesetting/overview/',publisher:'U.S. Web Design System'},
 contrast:{title:'Understanding SC 1.4.3: Contrast (Minimum)',url:'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',publisher:'W3C WAI'},
 focus:{title:'Understanding SC 2.4.7: Focus Visible',url:'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html',publisher:'W3C WAI'},
 labels:{title:'Understanding SC 3.3.2: Labels or Instructions',url:'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html',publisher:'W3C WAI'},
 needs:{title:'Learning about users and their needs',url:'https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs',publisher:'GOV.UK Service Manual'},
 testing:{title:'Using moderated usability testing',url:'https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing',publisher:'GOV.UK Service Manual'},
 prototypes:{title:'Making prototypes',url:'https://www.gov.uk/service-manual/design/making-prototypes',publisher:'GOV.UK Service Manual'},
 portfolio:{title:'5 Steps to Creating a UX-Design Portfolio',url:'https://www.nngroup.com/articles/ux-design-portfolios/',publisher:'Nielsen Norman Group'},
 critique:{title:'Design Critiques: Encourage a Positive Culture to Improve Products',url:'https://www.nngroup.com/articles/design-critiques/',publisher:'Nielsen Norman Group'},
 licenses:{title:'About CC Licenses',url:'https://creativecommons.org/cc-licenses/',publisher:'Creative Commons'},
 crop:{title:'GIMP 3.0 — Crop',url:'https://docs.gimp.org/3.0/en/gimp-tool-crop.html',publisher:'GIMP Documentation'},
 color:{title:'GIMP 3.0 — Colors Menu',url:'https://docs.gimp.org/3.0/en/gimp-colors-menu.html',publisher:'GIMP Documentation'},
 brightness:{title:'GIMP 3.0 — Brightness-Contrast',url:'https://docs.gimp.org/3.0/en/gimp-tool-brightness-contrast.html',publisher:'GIMP Documentation'},
 trim:{title:'Trim clips in Premiere',url:'https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/trim-a-clip.html',publisher:'Adobe Help'},
 gain:{title:'Adjust audio gain in Premiere',url:'https://helpx.adobe.com/premiere/desktop/add-audio-effects/adjust-volume-and-levels/adjust-gain-in-audio.html',publisher:'Adobe Help'},
 resolve:{title:'DaVinci Resolve — Training',url:'https://www.blackmagicdesign.com/products/davinciresolve/training',publisher:'Blackmagic Design'},
} satisfies Record<string,LessonSource>;
