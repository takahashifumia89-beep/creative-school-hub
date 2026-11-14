import { z } from 'zod';
const coordinate=z.number().finite().min(-10000).max(10000), color=z.string().regex(/^#[0-9a-f]{6}$/i);
export const modelObjectSchema=z.object({
 id:z.string().min(1).max(80),kind:z.enum(['box','sphere','cone','torus','cylinder','mesh']),name:z.string().max(80).optional(),hidden:z.boolean().optional(),locked:z.boolean().optional(),
 pos:z.tuple([coordinate,coordinate,coordinate]),rotY:coordinate,rotX:coordinate.optional(),rotZ:coordinate.optional(),scale:z.number().finite().min(.01).max(100),
 size:z.tuple([z.number().finite().min(.01).max(100),z.number().finite().min(.01).max(100),z.number().finite().min(.01).max(100)]).optional(),segments:z.number().int().min(3).max(64).optional(),
 color,metal:z.number().finite().min(0).max(1).optional(),rough:z.number().finite().min(0).max(1).optional(),flat:z.boolean().optional(),vertices:z.array(coordinate).max(30000).optional(),indices:z.array(z.number().int().min(0).max(9999)).max(60000).optional(),
}).superRefine((o,c)=>{if(o.kind!=='mesh')return;if(!o.vertices||o.vertices.length<9||o.vertices.length%3){c.addIssue({code:'custom',message:'A mesh needs complete vertex coordinates.',path:['vertices']});return;}if(!o.indices||o.indices.length<3||o.indices.length%3||o.indices.some(i=>i>=o.vertices!.length/3))c.addIssue({code:'custom',message:'Invalid triangle indices.',path:['indices']});});
export const sceneSchema=z.object({bg:color,light:z.number().finite().min(0).max(10).optional(),ground:z.boolean().optional(),wireframe:z.boolean().optional(),objects:z.array(modelObjectSchema).max(200)});
export type Obj=z.infer<typeof modelObjectSchema>;export type SceneDoc=z.infer<typeof sceneSchema>;
